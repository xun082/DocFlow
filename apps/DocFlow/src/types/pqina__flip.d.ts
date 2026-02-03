declare module '@pqina/flip' {
  interface TickDOMOptions {
    value: string;
    [key: string]: any;
  }

  interface TickDOM {
    value: string;
    destroy(): void;
  }

  interface Tick {
    DOM: {
      create(element: HTMLElement, options: TickDOMOptions): TickDOM;
    };
  }

  const Tick: Tick;
  export default Tick;
}
