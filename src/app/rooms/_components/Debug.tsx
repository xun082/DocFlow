import * as React from 'react';
import { useRoomContext } from '@livekit/components-react';
import { setLogLevel, LogLevel, RemoteTrackPublication, setLogExtension } from 'livekit-client';
// @ts-expect-error 没有ts类型文件
import { tinykeys } from 'tinykeys';
import { datadogLogs } from '@datadog/browser-logs';

import styles from '../styles/Debug.module.css';

export const useDebugMode = ({ logLevel }: { logLevel?: LogLevel }) => {
  const room = useRoomContext();

  React.useEffect(() => {
    setLogLevel(logLevel ?? 'debug');

    if (process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN && process.env.NEXT_PUBLIC_DATADOG_SITE) {
      console.log('setting up datadog logs');
      datadogLogs.init({
        clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
        site: process.env.NEXT_PUBLIC_DATADOG_SITE,
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
      });

      setLogExtension((level, msg, context) => {
        switch (level) {
          case LogLevel.debug:
            datadogLogs.logger.debug(msg, context);
            break;
          case LogLevel.info:
            datadogLogs.logger.info(msg, context);
            break;
          case LogLevel.warn:
            datadogLogs.logger.warn(msg, context);
            break;
          case LogLevel.error:
            datadogLogs.logger.error(msg, context);
            break;
          default:
            break;
        }
      });
    }

    // @ts-expect-error 挂在到全局window对象
    window.__lk_room = room;

    return () => {
      // @ts-expect-error 挂在到全局window对象
      window.__lk_room = undefined;
    };
  }, [room, logLevel]);
};

export const DebugMode = ({ logLevel }: { logLevel?: LogLevel }) => {
  const room = useRoomContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const [, setRender] = React.useState({});
  const [roomSid, setRoomSid] = React.useState('');

  React.useEffect(() => {
    room.getSid().then(setRoomSid);
  }, [room]);

  useDebugMode({ logLevel });

  React.useEffect(() => {
    if (window) {
      const unsubscribe = tinykeys(window, {
        'Shift+D': () => {
          console.log('setting open');
          setIsOpen((open) => !open);
        },
      });

      // timer to re-render
      const interval = setInterval(() => {
        setRender({});
      }, 1000);

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    }
  }, [isOpen]);

  if (typeof window === 'undefined' || !isOpen) {
    return null;
  }

  // const handleSimulate = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //   const { value } = event.target;

  //   if (value == '') {
  //     return;
  //   }

  //   event.target.value = '';

  //   let isReconnect = false;

  //   switch (value) {
  //     case 'signal-reconnect':
  //       isReconnect = true;

  //     // fall through
  //     default:
  //       // @ts-expect-error xxx
  //       room.simulateScenario(value);
  //   }
  // };

  const lp = room.localParticipant;

  if (!isOpen) {
    return <></>;
  } else {
    return (
      <div className={styles.overlay}>
        <section id="room-info">
          <h3>
            Room Info {room.name}: {roomSid}
          </h3>
        </section>
        <details open>
          <summary>
            <b>Local Participant: {lp.identity}</b>
          </summary>
          <details open className={styles.detailsSection}>
            <summary>
              <b>Published tracks</b>
            </summary>
            <div>
              {Array.from(lp.trackPublications.values()).map((t) => (
                <>
                  <div>
                    <i>
                      {t.source.toString()}
                      &nbsp;<span>{t.trackSid}</span>
                    </i>
                  </div>
                  <table>
                    <tbody>
                      <tr>
                        <td>Kind</td>
                        <td>
                          {t.kind}&nbsp;
                          {t.kind === 'video' && (
                            <span>
                              {t.track?.dimensions?.width}x{t.track?.dimensions?.height}
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Bitrate</td>
                        <td>{Math.ceil(t.track!.currentBitrate / 1000)} kbps</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ))}
            </div>
          </details>
          <details open className={styles.detailsSection}>
            <summary>
              <b>Permissions</b>
            </summary>
            <div>
              <table>
                <tbody>
                  {lp.permissions &&
                    Object.entries(lp.permissions).map(([key, val]) => (
                      <>
                        <tr>
                          <td>{key}</td>
                          {key !== 'canPublishSources' ? (
                            <td>{val.toString()}</td>
                          ) : (
                            <td> {val.join(', ')} </td>
                          )}
                        </tr>
                      </>
                    ))}
                </tbody>
              </table>
            </div>
          </details>
        </details>

        <details>
          <summary>
            <b>Remote Participants</b>
          </summary>
          {Array.from(room.remoteParticipants.values()).map((p) => (
            <details key={p.sid} className={styles.detailsSection}>
              <summary>
                <b>
                  {p.identity}
                  <span></span>
                </b>
              </summary>
              <div>
                {Array.from(p.trackPublications.values()).map((t) => (
                  <>
                    <div>
                      <i>
                        {t.source.toString()}
                        &nbsp;<span>{t.trackSid}</span>
                      </i>
                    </div>
                    <table>
                      <tbody>
                        <tr>
                          <td>Kind</td>
                          <td>
                            {t.kind}&nbsp;
                            {t.kind === 'video' && (
                              <span>
                                {t.dimensions?.width}x{t.dimensions?.height}
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>Status</td>
                          <td>{trackStatus(t)}</td>
                        </tr>
                        {t.track && (
                          <tr>
                            <td>Bitrate</td>
                            <td>{Math.ceil(t.track.currentBitrate / 1000)} kbps</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </>
                ))}
              </div>
            </details>
          ))}
        </details>
      </div>
    );
  }
};

function trackStatus(t: RemoteTrackPublication): string {
  if (t.isSubscribed) {
    return t.isEnabled ? 'enabled' : 'disabled';
  } else {
    return 'unsubscribed';
  }
}
