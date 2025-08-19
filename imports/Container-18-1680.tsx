function ThemeBlockBackground() {
  return (
    <div className="absolute h-[95px] left-0 top-0 w-[351px]" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

function PlanInfo() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 h-[49px] items-center justify-start leading-[0] p-0 relative shrink-0 text-center"
      data-name="Plan Info"
    >
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-nowrap">
        <p className="block leading-none whitespace-pre">Your current plan</p>
      </div>
      <div
        className="font-['Roboto Slab',_'Georgia',_'Times_New_Roman',_serif] font-normal min-w-full relative shrink-0 text-[#e1ff00] text-[24px]"
        style={{ width: "min-content" }}
      >
        <p className="block leading-[0.8]">FREE</p>
      </div>
    </div>
  );
}

export default function Container() {
  return (
    <div className="relative size-full" data-name="Container">
      <div className="flex flex-col items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-[20px] relative size-full">
          <ThemeBlockBackground />
          <PlanInfo />
        </div>
      </div>
    </div>
  );
}