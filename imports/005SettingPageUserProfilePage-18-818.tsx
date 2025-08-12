import svgPaths from "./svg-g4xzxza86y";

function Light() {
  return (
    <div
      className="absolute h-[130px] top-[-65px] translate-x-[-50%] w-[185px]"
      data-name="Light"
      style={{ left: "calc(50% + 1px)" }}
    >
      <div className="absolute inset-[-196.15%_-137.84%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 695 640">
          <g id="Light">
            <g filter="url(#filter0_f_13_381)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_13_381"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_13_381" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function SeparationLine() {
  return (
    <div className="absolute h-0 left-[21px] top-[351px] w-[351px]" data-name="Separation Line">
      <div
        className="absolute bottom-0 left-0 right-0 top-[-1px]"
        style={{ "--fill-0": "rgba(255, 255, 255, 1)" } as React.CSSProperties}
      >
        <svg className="block size-full" fill="none" preserveAspectRatio="none" role="presentation" viewBox="0 0 351 1">
          <g id="Separation Line">
            <rect fill="white" height="3.06854e-05" transform="translate(0 1)" width="351" />
            <line
              id="Sepapration line"
              stroke="var(--stroke-0, #2D2B2B)"
              x1="4.37114e-08"
              x2="351"
              y1="0.5"
              y2="0.500031"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

function BadgeIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Badge icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Badge icon">
          <path
            d={svgPaths.p29361940}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p33e06580}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p203c5100}
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M4 22H20"
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p30c79280}
            id="Vector_5"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p3f521e00}
            id="Vector_6"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <BadgeIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Bages</p>
      </div>
    </div>
  );
}

function BackButton25() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton26() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton25 />
        </div>
      </div>
    </div>
  );
}

function StatusItemContent() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Status item content"
    >
      <SurveyItem />
      <ForwardButton26 />
    </div>
  );
}

function StatusItem() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Status item"
    >
      <StatusItemContent />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Status item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function LevelIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Level icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Level icon">
          <path
            d={svgPaths.p35420c00}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p2727b3e0}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p3a4a0d50}
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p2140db20}
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem1() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <LevelIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Your level</p>
      </div>
    </div>
  );
}

function BackButton26() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton27() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton26 />
        </div>
      </div>
    </div>
  );
}

function StatusItemContent1() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Status item content"
    >
      <SurveyItem1 />
      <ForwardButton27 />
    </div>
  );
}

function StatusItem1() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Status item"
    >
      <StatusItemContent1 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Status item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function MentalStatusIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Mental status icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Mental status icon">
          <path
            d="M16 7H22V13"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p13253c0}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem2() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <MentalStatusIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">How are you status</p>
      </div>
    </div>
  );
}

function BackButton27() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton28() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton27 />
        </div>
      </div>
    </div>
  );
}

function StatusItemContent2() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Status item content"
    >
      <SurveyItem2 />
      <ForwardButton28 />
    </div>
  );
}

function StatusItem2() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Status item"
    >
      <StatusItemContent2 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Status item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function UnlockIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Unlock icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Unlock icon">
          <path
            d={svgPaths.p2dfab7c0}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p3c985200}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem3() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <UnlockIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">{`Unlock all themes & cards`}</p>
      </div>
    </div>
  );
}

function BackButton28() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton29() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton28 />
        </div>
      </div>
    </div>
  );
}

function StatusItemContent3() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Status item content"
    >
      <SurveyItem3 />
      <ForwardButton29 />
    </div>
  );
}

function StatusItem3() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Status item"
    >
      <StatusItemContent3 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Status item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function DonationIconV1() {
  return (
    <div className="relative shrink-0 size-6" data-name="Donation icon v1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Donation icon v1">
          <path
            d={svgPaths.p17418b80}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p3de716e0}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M2 16L8 22"
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p3ceac080}
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p286dd280}
            id="Vector_5"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem4() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <DonationIconV1 />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Make donation</p>
      </div>
    </div>
  );
}

function BackButton29() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton30() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton29 />
        </div>
      </div>
    </div>
  );
}

function StatusItemContent4() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Status item content"
    >
      <SurveyItem4 />
      <ForwardButton30 />
    </div>
  );
}

function StatusItem4() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Status item"
    >
      <StatusItemContent4 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Status item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function ActivityIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Activity icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Activity icon">
          <path
            d="M8 2V6"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M16 2V6"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p32f12c00}
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M3 10H21"
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M9 16L11 18L15 14"
            id="Vector_5"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem5() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <ActivityIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Your activity</p>
      </div>
    </div>
  );
}

function BackButton30() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton31() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton30 />
        </div>
      </div>
    </div>
  );
}

function StatusItemContent5() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Status item content"
    >
      <SurveyItem5 />
      <ForwardButton31 />
    </div>
  );
}

function StatusItem5() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Status item"
    >
      <StatusItemContent5 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Status item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function ShareIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Share icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Share icon">
          <path
            d={svgPaths.p240f9a80}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p66efb00}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.pd8f4e80}
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M8.59 13.51L15.42 17.49"
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M15.41 6.51L8.59 10.49"
            id="Vector_5"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem6() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <ShareIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Share app to friend</p>
      </div>
    </div>
  );
}

function BackButton31() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton32() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton31 />
        </div>
      </div>
    </div>
  );
}

function StatusItemContent6() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Status item content"
    >
      <SurveyItem6 />
      <ForwardButton32 />
    </div>
  );
}

function StatusItem6() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Status item"
    >
      <StatusItemContent6 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Status item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function StatusItems() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start leading-[0] p-0 relative shrink-0 w-full"
      data-name="Status items"
    >
      <StatusItem />
      <StatusItem1 />
      <StatusItem2 />
      <StatusItem3 />
      <StatusItem4 />
      <StatusItem5 />
      <StatusItem6 />
    </div>
  );
}

function StatusSection() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Status section"
    >
      <div className="font-['Roboto_Slab:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-full">
        <p className="block leading-[0.8]">Your status</p>
      </div>
      <StatusItems />
    </div>
  );
}

function ThemeBlockBackground() {
  return (
    <div className="[grid-area:1_/_1] h-[162px] ml-0 mt-0 relative w-[351px]" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

function SmallButton() {
  return (
    <div
      className="[grid-area:1_/_1] bg-[#e1ff00] box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center ml-[21px] mt-[98px] px-[126px] py-[15px] relative rounded-xl w-[310px]"
      data-name="Small button"
    >
      <div className="font-['PT_Sans:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Tell</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-6" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
          <path
            d={svgPaths.p79ef280}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M21.854 2.147L10.914 13.086"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function FeedbackContent() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-5 mt-[18px] p-0 relative w-[311px]"
      data-name="Feedback content"
    >
      <Frame />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#cfcfcf] text-[20px] text-left w-[269px]">
        <p className="block leading-none">Tell us how we can make the app better. Or you can just say thank you.</p>
      </div>
    </div>
  );
}

function FeedbackSection() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0"
      data-name="Feedback section"
    >
      <ThemeBlockBackground />
      <SmallButton />
      <FeedbackContent />
    </div>
  );
}

function LanguageIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Language icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Language icon">
          <path
            d={svgPaths.pace200}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p3d58bb40}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M2 12H22"
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem7() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <LanguageIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Language</p>
      </div>
    </div>
  );
}

function SettingsItemContent() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Settings item content"
    >
      <SurveyItem7 />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">English</p>
      </div>
    </div>
  );
}

function SettingsItem() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Settings item"
    >
      <SettingsItemContent />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Settings item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function ReminderIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Reminder icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Reminder icon">
          <path
            d={svgPaths.p369f8680}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p21b0a2c0}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem8() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <ReminderIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Daily reminder</p>
      </div>
    </div>
  );
}

function Switch() {
  return (
    <div
      className="absolute bg-[#2d2b2b] left-[18px] rounded-[100px] shadow-[0px_2px_4px_0px_rgba(39,39,39,0.1)] size-4 top-0.5"
      data-name="Switch"
    />
  );
}

function Switch1() {
  return (
    <div className="bg-[#e1ff00] h-5 relative rounded-[100px] shrink-0 w-9" data-name="Switch">
      <Switch />
    </div>
  );
}

function SettingsItemContent1() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Settings item content"
    >
      <SurveyItem8 />
      <Switch1 />
    </div>
  );
}

function SettingsItem1() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Settings item"
    >
      <SettingsItemContent1 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Settings item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function EncryptIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Encrypt icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Encrypt icon">
          <path
            d={svgPaths.p3f3d8e00}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M9 12L11 14L15 10"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem9() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <EncryptIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Security PIN</p>
      </div>
    </div>
  );
}

function BackButton32() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton33() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton32 />
        </div>
      </div>
    </div>
  );
}

function SettingsItemContent2() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Settings item content"
    >
      <SurveyItem9 />
      <ForwardButton33 />
    </div>
  );
}

function SettingsItem2() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Settings item"
    >
      <SettingsItemContent2 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Settings item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Info icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Info icon">
          <path
            d={svgPaths.pace200}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M12 16V12"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M12 8H12.01"
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem10() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <InfoIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">About app</p>
      </div>
    </div>
  );
}

function BackButton33() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton34() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton33 />
        </div>
      </div>
    </div>
  );
}

function SettingsItemContent3() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Settings item content"
    >
      <SurveyItem10 />
      <ForwardButton34 />
    </div>
  );
}

function SettingsItem3() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Settings item"
    >
      <SettingsItemContent3 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Settings item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function PrivacyIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Privacy icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Privacy icon">
          <path
            d={svgPaths.p1b4c8960}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p1b36a200}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M2 11H22"
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.pa8e3100}
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p129fa480}
            id="Vector_5"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem11() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <PrivacyIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Privacy policy</p>
      </div>
    </div>
  );
}

function BackButton34() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton35() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton34 />
        </div>
      </div>
    </div>
  );
}

function SettingsItemContent4() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Settings item content"
    >
      <SurveyItem11 />
      <ForwardButton35 />
    </div>
  );
}

function SettingsItem4() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Settings item"
    >
      <SettingsItemContent4 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Settings item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function TermsIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Terms icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Terms icon">
          <path
            d={svgPaths.p104a6f80}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M14 8H8"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M16 12H8"
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M13 16H8"
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem12() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <TermsIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Terms of use</p>
      </div>
    </div>
  );
}

function BackButton35() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, white)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton36() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton35 />
        </div>
      </div>
    </div>
  );
}

function SettingsItemContent5() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Settings item content"
    >
      <SurveyItem12 />
      <ForwardButton36 />
    </div>
  );
}

function SettingsItem5() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Settings item"
    >
      <SettingsItemContent5 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Settings item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function DeleteIcon() {
  return (
    <div className="relative shrink-0 size-6" data-name="Delete icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Delete icon">
          <path
            d="M10 11V17"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M14 11V17"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p31be5e80}
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M3 6H21"
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d={svgPaths.p2ee4b7e0}
            id="Vector_5"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SurveyItem13() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 h-6 items-center justify-start p-0 relative shrink-0"
      data-name="Survey_item"
    >
      <DeleteIcon />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Delete account</p>
      </div>
    </div>
  );
}

function BackButton36() {
  return (
    <div className="relative size-full" data-name="Back button 25">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Back button 25">
          <path
            d="M15 18L9 12L15 6"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function ForwardButton37() {
  return (
    <div className="relative shrink-0 size-6" data-name="Forward button 26">
      <div className="absolute flex inset-0 items-center justify-center">
        <div className="flex-none rotate-[180deg] size-6">
          <BackButton36 />
        </div>
      </div>
    </div>
  );
}

function SettingsItemContent6() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row items-center justify-between ml-0 mt-5 p-0 relative w-[351px]"
      data-name="Settings item content"
    >
      <SurveyItem13 />
      <ForwardButton37 />
    </div>
  );
}

function SettingsItem6() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0"
      data-name="Settings item"
    >
      <SettingsItemContent6 />
      <div className="[grid-area:1_/_1] h-16 ml-0 mt-0 relative w-[351px]" data-name="Settings item background">
        <div
          aria-hidden="true"
          className="absolute border-[#696969] border-[0px_0px_1px] border-solid inset-0 pointer-events-none"
        />
      </div>
    </div>
  );
}

function SettingsItems() {
  return (
    <div
      className="box-border content-stretch flex flex-col items-start justify-start leading-[0] p-0 relative shrink-0 w-full"
      data-name="Settings items"
    >
      <SettingsItem />
      <SettingsItem1 />
      <SettingsItem2 />
      <SettingsItem3 />
      <SettingsItem4 />
      <SettingsItem5 />
      <SettingsItem6 />
    </div>
  );
}

function SettingsSection() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Settings section"
    >
      <div className="font-['Roboto_Slab:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-full">
        <p className="block leading-[0.8]">Settings</p>
      </div>
      <SettingsItems />
    </div>
  );
}

function ContentContainer() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-10 items-start justify-start left-[21px] p-0 top-[391px] w-[351px]"
      data-name="content container"
    >
      <StatusSection />
      <FeedbackSection />
      <SettingsSection />
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="relative shrink-0 size-[120px]" data-name="User avatar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 120 120">
        <g id="User avatar">
          <circle cx="60" cy="60" fill="var(--fill-0, #E1FF00)" id="Ellipse 5" r="60" />
          <path d={svgPaths.p129d46f0} fill="var(--fill-0, #2D2B2B)" id="Logo" />
        </g>
      </svg>
    </div>
  );
}

function UserAccountStatus() {
  return (
    <div
      className="bg-[#e1ff00] box-border content-stretch flex flex-row h-[18px] items-center justify-center p-0 relative rounded-xl shrink-0 w-[69px]"
      data-name="User_account_status"
    >
      <div className="font-['PT_Sans:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Premium</p>
      </div>
    </div>
  );
}

function UserLevelAndPaidStatus() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0"
      data-name="User level and paid status"
    >
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#696969] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Level 25</p>
      </div>
      <UserAccountStatus />
    </div>
  );
}

function UserInfoBlock() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="User info block"
    >
      <div className="font-['Kreon:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left text-nowrap">
        <p className="block leading-[0.8] whitespace-pre">Hero #1275</p>
      </div>
      <UserLevelAndPaidStatus />
    </div>
  );
}

function UserInfoSection() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-center justify-start left-[21px] p-0 top-[142px] w-[351px]"
      data-name="User info section"
    >
      <UserAvatar />
      <UserInfoBlock />
    </div>
  );
}

function BackButton() {
  return (
    <div className="absolute left-[21px] size-12 top-[53px]" data-name="Back button">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Back button">
          <path
            d="M17 36L5 24L17 12"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function SymbolBig() {
  return (
    <div className="h-[13px] relative w-2" data-name="Symbol_big">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
        <g id="Symbol_big">
          <path d={svgPaths.p377b7c00} fill="var(--fill-0, #E1FF00)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

function MenhausenBeta() {
  return (
    <div className="absolute inset-[2.21%_6.75%_7.2%_10.77%]" data-name="Menhausen beta">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 106 12">
        <g id="Menhausen beta">
          <path d={svgPaths.p25a36300} fill="var(--fill-0, #E1FF00)" id="Vector" />
          <path d={svgPaths.p1120ed00} fill="var(--fill-0, #E1FF00)" id="Vector_2" />
          <path d={svgPaths.p33898780} fill="var(--fill-0, #E1FF00)" id="Vector_3" />
          <path d={svgPaths.p9060800} fill="var(--fill-0, #E1FF00)" id="Vector_4" />
          <path d={svgPaths.p32d14cf0} fill="var(--fill-0, #CFCFCF)" id="Vector_5" />
          <path d={svgPaths.p1786c280} fill="var(--fill-0, #CFCFCF)" id="Vector_6" />
          <path d={svgPaths.p23ce7e00} fill="var(--fill-0, #CFCFCF)" id="Vector_7" />
          <path d={svgPaths.p35fc2600} fill="var(--fill-0, #CFCFCF)" id="Vector_8" />
          <path d={svgPaths.p30139900} fill="var(--fill-0, #CFCFCF)" id="Vector_9" />
          <path d={svgPaths.p33206e80} fill="var(--fill-0, #CFCFCF)" id="Vector_10" />
          <path d={svgPaths.p2cb2bd40} fill="var(--fill-0, #CFCFCF)" id="Vector_11" />
          <path d={svgPaths.p3436ffe0} fill="var(--fill-0, #CFCFCF)" id="Vector_12" />
          <path d={svgPaths.p296762f0} fill="var(--fill-0, #CFCFCF)" id="Vector_13" />
        </g>
      </svg>
    </div>
  );
}

function MiniStripeLogo() {
  return (
    <div className="absolute h-[13px] left-[133px] top-[69px] w-32" data-name="Mini_stripe_logo">
      <div className="absolute flex h-[13px] items-center justify-center left-0 top-1/2 translate-y-[-50%] w-2">
        <div className="flex-none rotate-[180deg]">
          <SymbolBig />
        </div>
      </div>
      <MenhausenBeta />
    </div>
  );
}

export default function Component005SettingPageUserProfilePage() {
  return (
    <div className="bg-[#111111] relative size-full" data-name="005_Setting page/user profile page">
      <Light />
      <SeparationLine />
      <ContentContainer />
      <UserInfoSection />
      <BackButton />
      <MiniStripeLogo />
    </div>
  );
}