import svgPaths from "./svg-yl2fpr7m1a";

function Light() {
  return (
    <div className="absolute h-[917px] left-1/2 top-[-65px] translate-x-[-50%] w-[211px]" data-name="Light">
      <div className="absolute inset-[-27.81%_-120.85%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 721 1427">
          <g id="Light">
            <g filter="url(#filter0_f_17_905)" id="Ellipse 2">
              <ellipse cx="361.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
            <g filter="url(#filter1_f_17_905)" id="Ellipse 1">
              <ellipse cx="360.5" cy="1113.5" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="105.5" ry="58.5" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_17_905"
              width="695"
              x="14"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_17_905" stdDeviation="127.5" />
            </filter>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="627"
              id="filter1_f_17_905"
              width="721"
              x="0"
              y="800"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_17_905" stdDeviation="127.5" />
            </filter>
          </defs>
        </svg>
      </div>
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

function SeparationLine() {
  return (
    <div
      className="bg-[#ffffff] relative shrink-0 w-full"
      data-name="Separation Line"
      style={{ height: "3.06854e-05px" }}
    >
      <div
        className="absolute bottom-0 left-0 right-0 top-[-1px]"
        style={{ "--stroke-0": "rgba(45, 43, 43, 1)" } as React.CSSProperties}
      >
        <svg className="block size-full" fill="none" preserveAspectRatio="none" role="presentation" viewBox="0 0 351 1">
          <line
            id="Sepapration line"
            stroke="var(--stroke-0, #2D2B2B)"
            x1="4.37114e-08"
            x2="351"
            y1="0.5"
            y2="0.500031"
          />
        </svg>
      </div>
    </div>
  );
}

function CardInfo() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Card Info"
    >
      <div className="font-['Roboto_Slab:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[0px] text-left w-full">
        <p className="leading-[0.8] text-[24px]">
          <span>{`Card #1 / `}</span>
          <span className="text-[#696969]">26.02.1984</span>
        </p>
      </div>
      <SeparationLine />
    </div>
  );
}

function InputAnswerBlock() {
  return (
    <div
      className="bg-[rgba(217,217,217,0.04)] h-[85px] relative rounded-xl shrink-0 w-full"
      data-name="Input answer block"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
      />
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 h-[85px] items-center justify-center p-[20px] relative w-full">
          <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#cfcfcf] text-[20px] text-left w-[311px]">
            <p className="block leading-none">{`Oh, I don't know what to say. Everyone just pisses me off.`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputAnswerBlock1() {
  return (
    <div
      className="bg-[rgba(217,217,217,0.04)] h-[83px] relative rounded-xl shrink-0 w-full"
      data-name="Input answer block"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
      />
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 h-[83px] items-center justify-center p-[20px] relative w-full">
          <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#cfcfcf] text-[20px] text-left w-[311px]">
            <p className="block leading-none">{`I want everyone to just leave me alone and that's it`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame49() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[30px] items-start justify-start p-0 relative shrink-0 w-full">
      <div className="font-['PT_Sans:Regular',_sans-serif] h-11 leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[20px] text-left w-full">
        <p className="block leading-none">{`What in other people's behavior most often irritates or offends you?`}</p>
      </div>
      <InputAnswerBlock />
      <div className="font-['PT_Sans:Regular',_sans-serif] h-11 leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[20px] text-left w-full">
        <p className="block leading-none">What are your expectations behind this reaction?</p>
      </div>
      <InputAnswerBlock1 />
      <div className="font-['PT_Sans:Regular',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[0px] text-left w-full">
        <p className="block leading-none mb-0 text-[20px]">
          Awareness of expectations reduces the automaticity of emotional reactions.
        </p>
        <p className="block leading-none mb-0 text-[20px]">&nbsp;</p>
        <p className="block leading-none mb-0 text-[20px]">{`Track 3 irritating reactions over the course of a week and write down what you expected to happen at those moments. `}</p>
        <p className="block leading-none mb-0 text-[20px]">&nbsp;</p>
        <p className="leading-none text-[20px]">
          <span className="text-[#e1ff00]">Why:</span>
          <span>{` You learn to distinguish people's behavior from your own projections.`}</span>
        </p>
      </div>
    </div>
  );
}

function Frame50() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-10 items-start justify-start left-[21px] p-0 top-[141px] w-[351px]">
      <CardInfo />
      <Frame49 />
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

export default function ChekinPage() {
  return (
    <div className="bg-[#111111] relative size-full" data-name="Chekin page">
      <Light />
      <MiniStripeLogo />
      <Frame50 />
      <BackButton />
    </div>
  );
}