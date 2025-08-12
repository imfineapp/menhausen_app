export default function MoodPrograssbar() {
  return (
    <div className="bg-[#2d2b2b] relative rounded-xl size-full" data-name="Mood_prograssbar">
      <div className="absolute bg-[#e1ff00] h-[30px] left-0 rounded-xl top-0 w-[186px]" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border-2 border-[#2d2b2b] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}