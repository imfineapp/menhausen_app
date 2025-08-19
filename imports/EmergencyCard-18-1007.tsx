function CardAnonsStatus() {
  return (
    <div
      className="bg-[#2d2b2b] box-border content-stretch flex flex-row h-[18px] items-start justify-center p-0 relative rounded-xl shrink-0"
      data-name="Card_anons_status"
    >
      <div className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center tracking-[-0.43px] w-[66px]">
        <p className="adjustLetterSpacing block leading-[16px]">Soon</p>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-[249px]">
      <div
        className="font-['Kreon:Regular',_sans-serif] font-normal leading-[0] min-w-full relative shrink-0 text-[#313131] text-[24px] text-left"
        style={{ width: "min-content" }}
      >
        <p className="block leading-[0.8]">Emergency breathing patterns</p>
      </div>
      <div
        className="font-['PT Sans',_'Helvetica_Neue',_'Arial',_sans-serif] font-bold leading-[0] min-w-full not-italic relative shrink-0 text-[#333333] text-[20px] text-left"
        style={{ width: "min-content" }}
      >
        <p className="block leading-none">{`Check in with yourself — it's the first step to self-care! Do it everyday.`}</p>
      </div>
      <CardAnonsStatus />
    </div>
  );
}

export default function EmergencyCard() {
  return (
    <div className="bg-[#e1ff00] relative rounded-xl size-full" data-name="Emergency card">
      <div className="relative size-full">
        <div className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-[20px] relative size-full">
          <Frame22 />
        </div>
      </div>
    </div>
  );
}