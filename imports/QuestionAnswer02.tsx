import svgPaths from "./svg-umu7uxnce6";

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

function Button() {
  return (
    <div
      className="absolute bg-[#e1ff00] box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center left-[21px] px-[126px] py-[15px] rounded-xl top-[758px] w-[351px]"
      data-name="Button"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Next</p>
      </div>
    </div>
  );
}

function InputAnswerBlock() {
  return (
    <div
      className="bg-[rgba(217,217,217,0.04)] box-border content-stretch flex flex-col gap-2.5 h-[383px] items-center justify-start p-[20px] relative rounded-xl shrink-0 w-[351px]"
      data-name="Input answer block"
    >
      <div
        aria-hidden="true"
        className="absolute border border-[#505050] border-solid inset-0 pointer-events-none rounded-xl"
      />
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#cfcfcf] text-[20px] text-left w-[311px]">
        <p className="block leading-none">{`I want everyone to just leave me alone and that's it`}</p>
      </div>
    </div>
  );
}

function LockShieldFilled() {
  return (
    <div className="relative shrink-0 size-7" data-name="Lock Shield Filled">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="Lock Shield Filled">
          <path d={svgPaths.p70b1000} fill="var(--fill-0, #696969)" id="Shape" />
        </g>
      </svg>
    </div>
  );
}

function EncryptInfoBlock() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-2.5 items-center justify-start p-0 relative shrink-0 w-[351px]"
      data-name="Encrypt_info_block"
    >
      <LockShieldFilled />
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#696969] text-[14px] text-left w-[302px]">
        <p className="block leading-none">Your answers are fully protected with AES-256 encryption</p>
      </div>
    </div>
  );
}

function AnswerBlock() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-center justify-start p-0 relative shrink-0"
      data-name="Answer block"
    >
      <InputAnswerBlock />
      <EncryptInfoBlock />
    </div>
  );
}

function ContentBlock() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-5 items-start justify-start left-[21px] p-0 top-[141px] w-[351px]"
      data-name="Content block"
    >
      <div className="font-sans h-11 leading-[0] not-italic relative shrink-0 text-[#e1ff00] text-[20px] text-center w-full">
        <p className="block leading-none">What are your expectations behind this reaction?</p>
      </div>
      <AnswerBlock />
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

export default function QuestionAnswer02() {
  return (
    <div className="bg-[#111111] relative size-full" data-name="Question/answer-02">
      <Light />
      <Button />
      <ContentBlock />
      <MiniStripeLogo />
      <BackButton />
    </div>
  );
}