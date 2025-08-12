function ActivityProgress() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-row h-[11px] items-center justify-between left-5 p-0 top-[55px] w-[311px]"
      data-name="Activity progress"
    >
      <div className="bg-[#e1ff00] h-2.5 rounded-xl shrink-0 w-8" data-name="Progress bar" />
      <div className="bg-[#313131] h-2.5 rounded-xl shrink-0 w-8" data-name="Progress bar" />
      <div className="bg-[#313131] h-2.5 rounded-xl shrink-0 w-8" data-name="Progress bar" />
      <div className="bg-[#313131] h-2.5 rounded-xl shrink-0 w-8" data-name="Progress bar" />
      <div className="bg-[#e1ff00] h-2.5 rounded-xl shrink-0 w-8" data-name="Progress bar" />
      <div className="bg-[#e1ff00] h-2.5 rounded-xl shrink-0 w-8" data-name="Progress bar" />
      <div className="bg-[#e1ff00] h-2.5 rounded-xl shrink-0 w-8" data-name="Progress bar" />
      <div className="bg-[#e1ff00] h-2.5 rounded-xl shrink-0 w-8" data-name="Progress bar" />
    </div>
  );
}

function ActivityHeader() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-row font-['Kreon:Regular',_sans-serif] font-normal items-center justify-between leading-[0] left-4 p-0 text-[#e1ff00] text-[24px] text-nowrap top-4 w-[315px]"
      data-name="Activity header"
    >
      <div className="relative shrink-0 text-left">
        <p className="block leading-[0.8] text-nowrap whitespace-pre">Activity</p>
      </div>
      <div className="relative shrink-0 text-right">
        <p className="block leading-[0.8] text-nowrap whitespace-pre">4 days</p>
      </div>
    </div>
  );
}

export default function ActivityBlock() {
  return (
    <div className="relative size-full" data-name="Activity block">
      <div
        className="absolute bg-[rgba(217,217,217,0.04)] h-[141px] left-0 rounded-xl top-0 w-[351px]"
        data-name="Activity container"
      >
        <div
          aria-hidden="true"
          className="absolute border border-[#e1ff00] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <ActivityProgress />
      <ActivityHeader />
      <div className="absolute font-['PT_Sans:Regular',_sans-serif] leading-[0] left-5 not-italic text-[#ffffff] text-[20px] text-left top-[81px] w-[311px]">
        <p className="block leading-none">Only by doing exercises regularly will you achieve results.</p>
      </div>
    </div>
  );
}