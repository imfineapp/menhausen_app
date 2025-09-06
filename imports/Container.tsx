export default function Container() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start leading-[0] p-0 relative size-full text-center"
      data-name="Container"
    >
      <div className="font-heading font-normal relative shrink-0 text-[#cfcfcf] text-[0px] w-full">
        <p className="block leading-[0.8] mb-0 text-[36px]">{`You don't have `}</p>
        <p className="leading-[0.8] text-[36px]">
          <span className="text-[#e1ff00]">to cope</span>
          <span>{` alone`}</span>
        </p>
      </div>
      <div className="font-sans h-[89px] not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">{`Difficulties with others often start with uncertainty in oneself. Let's figure out what exactly is bothering us.`}</p>
      </div>
    </div>
  );
}