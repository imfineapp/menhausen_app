import svgPaths from "./svg-vn1j3wuqix";

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
            <g filter="url(#filter0_f_1_395)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_1_395"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_395" stdDeviation="127.5" />
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
      className="absolute bg-[#e1ff00] box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center left-[23px] px-[126px] py-[15px] rounded-xl top-[758px] w-[350px]"
      data-name="Button"
    >
      <div className="font-['PT_Sans:Bold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Next</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-12" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          <path
            d={svgPaths.p9795980}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.p3c832300}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

function TextBlock() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-col gap-2.5 items-end justify-start ml-0 mt-0 p-0 relative text-left w-[248px]"
      data-name="Text block"
    >
      <div className="font-['Roboto_Slab:Regular',_sans-serif] font-normal relative shrink-0 text-[#e1ff00] text-[24px] w-full">
        <p className="block leading-[0.8]">No login, no trace</p>
      </div>
      <div className="font-['PT_Sans:Regular',_sans-serif] not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">Works directly in Telegram. No accounts, no emails</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0"
      data-name="Container"
    >
      <TextBlock />
    </div>
  );
}

function Container1() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[13px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Icon />
      <Container />
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-12" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          <path
            d={svgPaths.p30533c80}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d="M18 24L22 28L30 20"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

function Container2() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 text-left"
      data-name="Container"
    >
      <div className="[grid-area:1_/_1] font-['PT_Sans:Regular',_sans-serif] ml-px mt-[29px] not-italic relative text-[#ffffff] text-[20px] w-[247px]">
        <p className="block leading-none">AES-256, Web3 technologies. Your data is protected at bank level</p>
      </div>
      <div className="[grid-area:1_/_1] font-['Roboto_Slab:Regular',_sans-serif] font-normal ml-0 mt-0 relative text-[#e1ff00] text-[24px] w-[248px]">
        <p className="block leading-[0.8]">Data encryption</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[13px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Icon1 />
      <Container2 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-12" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          <path
            d={svgPaths.p1589db80}
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d="M24 36H24.02"
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

function Container4() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 text-left"
      data-name="Container"
    >
      <div className="[grid-area:1_/_1] font-['PT_Sans:Regular',_sans-serif] ml-px mt-[29px] not-italic relative text-[#ffffff] text-[20px] w-[247px]">
        <p className="block leading-none">In your pocket, in Telegram. Help available 24/7, when you need it</p>
      </div>
      <div className="[grid-area:1_/_1] font-['Roboto_Slab:Regular',_sans-serif] font-normal ml-0 mt-0 relative text-[#e1ff00] text-[24px] w-[248px]">
        <p className="block leading-[0.8]">Always with you</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[13px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Icon2 />
      <Container4 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-12" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Icon">
          <path
            d="M24 36V10"
            id="Vector"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.p2dc41780}
            id="Vector_2"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.p1b1a1f80}
            id="Vector_3"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.p1d1c280}
            id="Vector_4"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.p34270280}
            id="Vector_5"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.pa33b72a}
            id="Vector_6"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.pd982560}
            id="Vector_7"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
          <path
            d={svgPaths.pc2aa900}
            id="Vector_8"
            stroke="var(--stroke-0, #E1FF00)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>
  );
}

function Container6() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 text-left"
      data-name="Container"
    >
      <div className="[grid-area:1_/_1] font-['PT_Sans:Regular',_sans-serif] ml-px mt-12 not-italic relative text-[#ffffff] text-[20px] w-[247px]">
        <p className="block leading-none">
          CBT, ACT, MBCT, positive psychology — scientifically proven methods No sugarcoating. Direct, honest, to the
          point. Man to man
        </p>
      </div>
      <div className="[grid-area:1_/_1] font-['Roboto_Slab:Regular',_sans-serif] font-normal ml-0 mt-0 relative text-[#e1ff00] text-[24px] w-[248px]">
        <p className="block leading-[0.8]">Based on evidence-based practices</p>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[13px] items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <Icon3 />
      <Container6 />
    </div>
  );
}

function ContentBlock() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-10 items-start justify-start left-[42px] p-0 top-36 w-[310px]"
      data-name="Content block"
    >
      <Container1 />
      <Container3 />
      <Container5 />
      <Container7 />
    </div>
  );
}

function SymbolBig() {
  return (
    <div className="relative size-full" data-name="Symbol_big">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 13">
        <g id="Symbol_big">
          <path d={svgPaths.p377b7c00} fill="var(--fill-0, #E1FF00)" id="Union" />
        </g>
      </svg>
    </div>
  );
}

function Menhausen() {
  return (
    <div className="absolute inset-[2.21%_1.17%_7.2%_15.49%]" data-name="Menhausen">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 75 12">
        <g id="Menhausen">
          <path d={svgPaths.p32d14cf0} fill="var(--fill-0, #CFCFCF)" id="Vector" />
          <path d={svgPaths.p1786c280} fill="var(--fill-0, #CFCFCF)" id="Vector_2" />
          <path d={svgPaths.p23ce7e00} fill="var(--fill-0, #CFCFCF)" id="Vector_3" />
          <path d={svgPaths.p35fc2600} fill="var(--fill-0, #CFCFCF)" id="Vector_4" />
          <path d={svgPaths.p30139900} fill="var(--fill-0, #CFCFCF)" id="Vector_5" />
          <path d={svgPaths.p33206e80} fill="var(--fill-0, #CFCFCF)" id="Vector_6" />
          <path d={svgPaths.p2cb2bd40} fill="var(--fill-0, #CFCFCF)" id="Vector_7" />
          <path d={svgPaths.p3436ffe0} fill="var(--fill-0, #CFCFCF)" id="Vector_8" />
          <path d={svgPaths.p2d60800} fill="var(--fill-0, #CFCFCF)" id="Vector_9" />
        </g>
      </svg>
    </div>
  );
}

function MiniStripeLogo() {
  return (
    <div className="absolute h-[13px] left-[152px] top-[69px] w-[89px]" data-name="Mini_stripe_logo">
      <div className="absolute bottom-0 flex items-center justify-center left-0 right-[91.01%] top-0">
        <div className="flex-none h-[13px] rotate-[180deg] w-2">
          <SymbolBig />
        </div>
      </div>
      <Menhausen />
    </div>
  );
}

export default function Component002OnboardingPage02() {
  return (
    <div className="bg-[#111111] relative size-full" data-name="002_onboarding page_02">
      <Light />
      <Button />
      <ContentBlock />
      <MiniStripeLogo />
    </div>
  );
}