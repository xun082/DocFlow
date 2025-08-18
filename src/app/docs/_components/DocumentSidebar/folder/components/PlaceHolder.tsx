export function DropPlaceHolder({ depth }: { depth: number }) {
  return (
    <div
      className={`h-[57px] my-1  pointer-events-none flex hover:bg-sky-200 transition-all items-center   justify-center  w-full  rounded-xs   border-dashed border-[1.5px] border-blue-600`}
      style={{ marginLeft: 16 * depth + 'px' }}
    >
      文件放置区
    </div>
  );
}
