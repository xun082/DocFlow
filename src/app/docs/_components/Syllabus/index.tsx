import clsx from 'clsx';

export interface SyllabusTitle {
  id: string;
  textCont: string;
}

export interface SyllabusPros {
  lightId: string;
  syllabusTitle: SyllabusTitle[];
}

export const Syllabus = (props: SyllabusPros) => {
  // 修改hash
  const hashChange = (e: string) => {
    window.location.hash = e;
  };

  return (
    <>
      <p className="mb-2 ml-4 text-[12px] font-[600] text-zinc-800">大纲</p>
      <ul className="border-l-1.5 border-gray-600">
        {props.syllabusTitle?.map((e) => {
          return (
            <li
              key={e.id}
              onClick={() => hashChange(e.id)}
              className={clsx([
                props.lightId === e.id ? `h-full font-[600] text-zinc-600` : '',
                `mx-4 mb-2 cursor-pointer overflow-hidden text-[12px] font-[300] text-nowrap text-ellipsis text-zinc-500 hover:font-[600] hover:text-zinc-700`,
              ])}
            >
              {e.textCont}
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default Syllabus;
