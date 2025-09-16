import svgPaths from "./svg-9v3gqqhb3l";

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
            <g filter="url(#filter0_f_1_796)" id="Ellipse 2">
              <ellipse cx="347.5" cy="320" fill="var(--fill-0, #999999)" fillOpacity="0.3" rx="92.5" ry="65" />
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="640"
              id="filter0_f_1_796"
              width="695"
              x="0"
              y="0"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
              <feGaussianBlur result="effect1_foregroundBlur_1_796" stdDeviation="127.5" />
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

function UserAvatar() {
  return (
    <div className="relative shrink-0 size-[62px]" data-name="User avatar">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62 62">
        <g id="User avatar">
          <circle cx="31" cy="31" fill="var(--fill-0, #E1FF00)" id="Ellipse 5" r="31" />
          <path d={svgPaths.p1b541b00} fill="var(--fill-0, #2D2B2B)" id="Logo" />
        </g>
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 size-6" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">
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

function UserInfo() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-start justify-between p-0 relative shrink-0 w-full"
      data-name="User info"
    >
      <div className="font-['Kreon:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-[164px]">
        <p className="block leading-[0.8]">Hero #1275</p>
      </div>
      <Frame />
    </div>
  );
}

function UserAccountStatus() {
  return (
    <div
      className="bg-[#e1ff00] box-border content-stretch flex flex-row h-[18px] items-center justify-center p-0 relative rounded-xl shrink-0 w-[69px]"
      data-name="User_account_status"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
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
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#696969] text-[20px] text-left text-nowrap">
        <p className="block leading-none whitespace-pre">Level 25</p>
      </div>
      <UserAccountStatus />
    </div>
  );
}

function UserInfoBlock() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-[274px]"
      data-name="User info block"
    >
      <UserInfo />
      <UserLevelAndPaidStatus />
    </div>
  );
}

function UserFrameInfoBlock() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-5 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="User frame info block"
    >
      <UserAvatar />
      <UserInfoBlock />
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
            stroke="var(--stroke-0, #2D2B2B)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M12 16V12"
            id="Vector_2"
            stroke="var(--stroke-0, #2D2B2B)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <path
            d="M12 8H12.01"
            id="Vector_3"
            stroke="var(--stroke-0, #2D2B2B)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  );
}

function InfoGroup() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-center justify-between p-0 relative shrink-0 w-full"
      data-name="Info_group"
    >
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#2d2b2b] text-[24px] text-left text-nowrap">
        <p className="block leading-[0.8] whitespace-pre">How are you?</p>
      </div>
      <InfoIcon />
    </div>
  );
}

function StartMining() {
  return (
    <div className="bg-[#2d2b2b] h-[46px] relative rounded-xl shrink-0 w-full" data-name="Start Mining">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center px-[126px] py-[15px] relative w-full">
          <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
            <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Send</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoContainer() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-[311px]"
      data-name="Info container"
    >
      <InfoGroup />
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[20px] text-left w-full">
        <p className="block leading-none">{`Check in with yourself — it's the first step to self-care! Do it everyday.`}</p>
      </div>
      <StartMining />
    </div>
  );
}

function HayouBlock() {
  return (
    <div
      className="bg-[#e1ff00] box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-[20px] relative rounded-xl shrink-0"
      data-name="HAYOU_block"
    >
      <InfoContainer />
    </div>
  );
}

function ActivityProgress() {
  return (
    <div
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row h-[11px] items-center justify-between ml-5 mt-[55px] p-0 relative w-[311px]"
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
      className="[grid-area:1_/_1] box-border content-stretch flex flex-row font-['Kreon:Regular',_sans-serif] font-normal items-center justify-between ml-4 mt-4 p-0 relative text-[#e1ff00] text-[24px] text-nowrap w-[315px]"
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

function ActivityBlock() {
  return (
    <div
      className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0"
      data-name="Activity block"
    >
      <div
        className="[grid-area:1_/_1] bg-[rgba(217,217,217,0.04)] h-[141px] ml-0 mt-0 relative rounded-xl w-[351px]"
        data-name="Activity container"
      >
        <div
          aria-hidden="true"
          className="absolute border border-[#e1ff00] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
      <ActivityProgress />
      <ActivityHeader />
      <div className="[grid-area:1_/_1] font-sans ml-5 mt-[81px] not-italic relative text-[#ffffff] text-[20px] text-left w-[311px]">
        <p className="block leading-none">Only by doing exercises regularly will you achieve results.</p>
      </div>
    </div>
  );
}

function UserAccountStatus1() {
  return (
    <div
      className="bg-[#2d2b2b] box-border content-stretch flex flex-row h-[18px] items-center justify-center p-0 relative rounded-xl shrink-0 w-[62px]"
      data-name="User_account_status"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Free</p>
      </div>
    </div>
  );
}

function MotivationAndStatusBlock() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-end justify-between p-0 relative shrink-0 w-full"
      data-name="Motivation_and_status_block"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#696969] text-[16px] text-left w-[235px]">
        <p className="block leading-none">Use 80% users</p>
      </div>
      <UserAccountStatus1 />
    </div>
  );
}

function ContentBlockThemeCard() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Content_block_theme_card"
    >
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-full">
        <p className="block leading-[0.8]">Stress</p>
      </div>
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left w-full">
        <p className="block leading-none">Some text about theme. Some text about theme.</p>
      </div>
      <MotivationAndStatusBlock />
    </div>
  );
}

function ThemeBlockBackground() {
  return (
    <div className="absolute inset-0" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

function ProgressTheme() {
  return (
    <div className="h-6 relative shrink-0 w-[351px]" data-name="Progress_theme">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block" />
      <div className="absolute font-sans inset-[12.5%_4.56%_20.83%_4.56%] leading-[0] not-italic text-[#696969] text-[16px] text-right">
        <p className="block leading-none">Progress</p>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[154px] items-center justify-end left-0 p-0 top-0">
      <ThemeBlockBackground />
      <ProgressTheme />
    </div>
  );
}

function ThemeCardNarrow() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 h-[154px] items-start justify-start p-[20px] relative shrink-0 w-[351px]"
      data-name="Theme card narrow"
    >
      <ContentBlockThemeCard />
      <Frame22 />
    </div>
  );
}

function UserAccountStatus2() {
  return (
    <div
      className="bg-[#2d2b2b] box-border content-stretch flex flex-row h-[18px] items-center justify-center p-0 relative rounded-xl shrink-0 w-[62px]"
      data-name="User_account_status"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Free</p>
      </div>
    </div>
  );
}

function MotivationAndStatusBlock1() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-end justify-between p-0 relative shrink-0 w-full"
      data-name="Motivation_and_status_block"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#696969] text-[16px] text-left w-[235px]">
        <p className="block leading-none">Use 80% users</p>
      </div>
      <UserAccountStatus2 />
    </div>
  );
}

function ContentBlockThemeCard1() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Content_block_theme_card"
    >
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-full">
        <p className="block leading-[0.8]">Angry</p>
      </div>
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left w-full">
        <p className="block leading-none">Some text about theme. Some text about theme.</p>
      </div>
      <MotivationAndStatusBlock1 />
    </div>
  );
}

function ThemeBlockBackground1() {
  return (
    <div className="absolute inset-0" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

function ProgressTheme1() {
  return (
    <div className="h-6 relative shrink-0 w-[351px]" data-name="Progress_theme">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block" />
      <div className="absolute bg-[#e1ff00] bottom-0 left-0 right-[80.06%] rounded-xl top-0" data-name="Block" />
      <div className="absolute font-sans inset-[12.5%_4.56%_20.83%_4.56%] leading-[0] not-italic text-[#696969] text-[16px] text-right">
        <p className="block leading-none">Progress</p>
      </div>
    </div>
  );
}

function Frame23() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[154px] items-center justify-end left-0 p-0 top-0">
      <ThemeBlockBackground1 />
      <ProgressTheme1 />
    </div>
  );
}

function ThemeCardNarrow1() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 h-[154px] items-start justify-start p-[20px] relative shrink-0 w-[351px]"
      data-name="Theme card narrow"
    >
      <ContentBlockThemeCard1 />
      <Frame23 />
    </div>
  );
}

function ThemeBlockBackground2() {
  return (
    <div className="absolute inset-0" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

function UserAccountStatus3() {
  return (
    <div
      className="bg-[#e1ff00] box-border content-stretch flex flex-row h-[18px] items-center justify-center p-0 relative rounded-xl shrink-0 w-[69px]"
      data-name="User_account_status"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Premium</p>
      </div>
    </div>
  );
}

function MotivationAndStatusBlock2() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-end justify-between p-0 relative shrink-0 w-full"
      data-name="Motivation_and_status_block"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#696969] text-[16px] text-left w-[235px]">
        <p className="block leading-none">Use 80% users</p>
      </div>
      <UserAccountStatus3 />
    </div>
  );
}

function ContentBlockThemeCard2() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-2.5 items-start justify-start left-[13px] p-0 top-[17px] w-[327px]"
      data-name="Content_block_theme_card"
    >
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-full">
        <p className="block leading-[0.8]">Sadness and apathy</p>
      </div>
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left w-full">
        <p className="block leading-none">Some text about theme. Some text about theme.</p>
      </div>
      <MotivationAndStatusBlock2 />
    </div>
  );
}

function ThemeCardNarrow2() {
  return (
    <div className="h-[130px] relative shrink-0 w-[351px]" data-name="Theme card narrow">
      <ThemeBlockBackground2 />
      <ContentBlockThemeCard2 />
    </div>
  );
}

function MotivationAndStatusBlock3() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-1 items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Motivation_and_status_block"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#696969] text-[16px] text-left w-[235px]">
        <p className="block leading-none">Use 80% users</p>
      </div>
    </div>
  );
}

function ContentBlockThemeCard3() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Content_block_theme_card"
    >
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-full">
        <p className="block leading-[0.8]">Anxiety</p>
      </div>
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left w-full">
        <p className="block leading-none">Some text about theme. Some text about theme.</p>
      </div>
      <MotivationAndStatusBlock3 />
    </div>
  );
}

function ThemeBlockBackground3() {
  return (
    <div className="absolute inset-0" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

function ProgressTheme2() {
  return (
    <div className="h-6 relative shrink-0 w-[351px]" data-name="Progress_theme">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block" />
      <div className="absolute bg-[#e1ff00] bottom-0 left-0 right-[40.17%] rounded-xl top-0" data-name="Block" />
      <div className="absolute font-sans inset-[12.5%_4.56%_20.83%_4.56%] leading-[0] not-italic text-[#696969] text-[16px] text-right">
        <p className="block leading-none">Progress</p>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[154px] items-center justify-end left-0 p-0 top-0">
      <ThemeBlockBackground3 />
      <ProgressTheme2 />
    </div>
  );
}

function ThemeCardNarrow3() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 h-[154px] items-start justify-start p-[20px] relative shrink-0 w-[351px]"
      data-name="Theme card narrow"
    >
      <ContentBlockThemeCard3 />
      <Frame24 />
    </div>
  );
}

function UserAccountStatus4() {
  return (
    <div
      className="bg-[#2d2b2b] box-border content-stretch flex flex-row h-[18px] items-center justify-center p-0 relative rounded-xl shrink-0 w-[62px]"
      data-name="User_account_status"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center text-nowrap tracking-[-0.43px]">
        <p className="adjustLetterSpacing block leading-[16px] whitespace-pre">Free</p>
      </div>
    </div>
  );
}

function MotivationAndStatusBlock4() {
  return (
    <div
      className="box-border content-stretch flex flex-row items-end justify-between p-0 relative shrink-0 w-full"
      data-name="Motivation_and_status_block"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#696969] text-[16px] text-left w-[235px]">
        <p className="block leading-none">Use 80% users</p>
      </div>
      <UserAccountStatus4 />
    </div>
  );
}

function ContentBlockThemeCard4() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Content_block_theme_card"
    >
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-full">
        <p className="block leading-[0.8]">Lack and self-confidence</p>
      </div>
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left w-full">
        <p className="block leading-none">Some text about theme. Some text about theme.</p>
      </div>
      <MotivationAndStatusBlock4 />
    </div>
  );
}

function ThemeBlockBackground4() {
  return (
    <div className="absolute inset-0" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

function ProgressTheme3() {
  return (
    <div className="h-6 relative shrink-0 w-[351px]" data-name="Progress_theme">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block" />
      <div className="absolute bg-[#e1ff00] bottom-0 left-0 right-[10.26%] rounded-xl top-0" data-name="Block" />
      <div className="absolute font-sans inset-[12.5%_4.56%_20.83%_4.56%] leading-[0] not-italic text-[#696969] text-[16px] text-left">
        <p className="block leading-none">Progress</p>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[154px] items-center justify-end left-0 p-0 top-0">
      <ThemeBlockBackground4 />
      <ProgressTheme3 />
    </div>
  );
}

function ThemeCardNarrow4() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 h-[154px] items-start justify-start p-[20px] relative shrink-0 w-[351px]"
      data-name="Theme card narrow"
    >
      <ContentBlockThemeCard4 />
      <Frame25 />
    </div>
  );
}

function MotivationAndStatusBlock5() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-1 items-end justify-start p-0 relative shrink-0 w-full"
      data-name="Motivation_and_status_block"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#696969] text-[16px] text-left w-[235px]">
        <p className="block leading-none">Use 80% users</p>
      </div>
    </div>
  );
}

function ContentBlockThemeCard5() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-start justify-start p-0 relative shrink-0 w-full"
      data-name="Content_block_theme_card"
    >
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-full">
        <p className="block leading-[0.8]">Relationships an family</p>
      </div>
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#ffffff] text-[20px] text-left w-full">
        <p className="block leading-none">Some text about theme. Some text about theme.</p>
      </div>
      <MotivationAndStatusBlock5 />
    </div>
  );
}

function ThemeBlockBackground5() {
  return (
    <div className="absolute inset-0" data-name="theme_block_background">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

function ProgressTheme4() {
  return (
    <div className="h-6 relative shrink-0 w-[351px]" data-name="Progress_theme">
      <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block" />
      <div className="absolute bg-[#e1ff00] inset-0 rounded-xl" data-name="Block" />
      <div className="absolute font-sans inset-[12.5%_4.56%_20.83%_4.56%] leading-[0] not-italic text-[#696969] text-[16px] text-left">
        <p className="block leading-none">Progress</p>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="absolute box-border content-stretch flex flex-col h-[154px] items-center justify-end left-0 p-0 top-0">
      <ThemeBlockBackground5 />
      <ProgressTheme4 />
    </div>
  );
}

function ThemeCardNarrow5() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 h-[154px] items-start justify-start p-[20px] relative shrink-0 w-[351px]"
      data-name="Theme card narrow"
    >
      <ContentBlockThemeCard5 />
      <Frame26 />
    </div>
  );
}

function WorriesList() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-[351px]"
      data-name="Worries list"
    >
      <ThemeCardNarrow />
      <ThemeCardNarrow1 />
      <ThemeCardNarrow2 />
      <ThemeCardNarrow3 />
      <ThemeCardNarrow4 />
      <ThemeCardNarrow5 />
    </div>
  );
}

function WorriesContainer() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-[30px] items-start justify-start p-0 relative shrink-0"
      data-name="Worries container"
    >
      <div className="font-['Kreon:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-[351px]">
        <p className="block leading-[0.8]">What worries you?</p>
      </div>
      <WorriesList />
    </div>
  );
}

function CardAnonsStatus() {
  return (
    <div
      className="bg-[#2d2b2b] box-border content-stretch flex flex-row h-[18px] items-start justify-center p-0 relative rounded-xl shrink-0"
      data-name="Card_anons_status"
    >
      <div className="font-sans font-bold leading-[0] not-italic relative shrink-0 text-[#2d2b2b] text-[15px] text-center tracking-[-0.43px] w-[66px]">
        <p className="adjustLetterSpacing block leading-[16px]">Soon</p>
      </div>
    </div>
  );
}

function Frame27() {
  return (
    <div className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-[249px]">
      <div
        className="font-['Kreon:Regular',_sans-serif] font-normal leading-[0] min-w-full relative shrink-0 text-[#313131] text-[24px] text-left"
        style={{ width: "min-content" }}
      >
        <p className="block leading-[0.8]">Emergency breathing patterns</p>
      </div>
      <div
        className="font-sans font-bold leading-[0] min-w-full not-italic relative shrink-0 text-[#333333] text-[20px] text-left"
        style={{ width: "min-content" }}
      >
        <p className="block leading-none">{`Check in with yourself — it's the first step to self-care! Do it everyday.`}</p>
      </div>
      <CardAnonsStatus />
    </div>
  );
}

function EmergencyCard() {
  return (
    <div
      className="bg-[#e1ff00] box-border content-stretch flex flex-col gap-2.5 h-[197px] items-start justify-start p-[20px] relative rounded-xl shrink-0 w-[296px]"
      data-name="Emergency card"
    >
      <Frame27 />
    </div>
  );
}

function SliderEmergency() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[15px] items-center justify-start p-0 relative shrink-0"
      data-name="Slider_emergency"
    >
      {[...Array(5).keys()].map((_, i) => (
        <EmergencyCard key={i} />
      ))}
    </div>
  );
}

function EmergencyBlock() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start p-0 relative shrink-0"
      data-name="Emergency_block"
    >
      <div className="font-['Kreon:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[#e1ff00] text-[24px] text-left w-[351px]">
        <p className="block leading-[0.8]">Quick mental help</p>
      </div>
      <SliderEmergency />
    </div>
  );
}

function SocialIcons() {
  return (
    <div className="relative shrink-0 size-12" data-name="Social Icons">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g clipPath="url(#clip0_2_2114)" id="Social Icons">
          <path
            clipRule="evenodd"
            d={svgPaths.p201ec800}
            fill="var(--fill-0, #2D2B2B)"
            fillRule="evenodd"
            id="Vector"
          />
        </g>
        <defs>
          <clipPath id="clip0_2_2114">
            <rect fill="white" height="48" width="48" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Frame42() {
  return (
    <div className="absolute box-border content-stretch flex flex-row gap-[13px] inset-[17.81%_7.83%_16.44%_7.83%] items-center justify-start p-0">
      <SocialIcons />
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#2d2b2b] text-[24px] text-nowrap text-right">
        <p className="block leading-[0.8] whitespace-pre">Follow</p>
      </div>
    </div>
  );
}

function Group20() {
  return (
    <div className="absolute contents inset-0">
      <div className="absolute bg-[#e1ff00] inset-0 rounded-xl" />
      <Frame42 />
    </div>
  );
}

function FollowButton() {
  return (
    <div className="h-[73px] relative shrink-0 w-[166px]" data-name="Follow button">
      <Group20 />
    </div>
  );
}

function SocialIcons1() {
  return (
    <div className="relative shrink-0 size-12" data-name="Social Icons">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
        <g id="Social Icons">
          <path d={svgPaths.p118f24c0} fill="var(--fill-0, #2D2B2B)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame43() {
  return (
    <div className="absolute box-border content-stretch flex flex-row gap-[13px] inset-[17.81%_7.83%_16.44%_7.83%] items-center justify-start p-0">
      <SocialIcons1 />
      <div className="font-heading font-normal leading-[0] relative shrink-0 text-[#2d2b2b] text-[24px] text-nowrap text-right">
        <p className="block leading-[0.8] whitespace-pre">Follow</p>
      </div>
    </div>
  );
}

function Group21() {
  return (
    <div className="absolute contents inset-0">
      <div className="absolute bg-[#e1ff00] inset-0 rounded-xl" />
      <Frame43 />
    </div>
  );
}

function FollowButton1() {
  return (
    <div className="h-[73px] relative shrink-0 w-[166px]" data-name="Follow button">
      <Group21 />
    </div>
  );
}

function FollowBlock() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[19px] items-center justify-start p-0 relative shrink-0"
      data-name="Follow_block"
    >
      <FollowButton />
      <FollowButton1 />
    </div>
  );
}

function MainPageContenctBlock() {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-[60px] items-start justify-start left-[21px] p-0 top-[109px] w-[351px]"
      data-name="Main_page_contenct_block"
    >
      <UserFrameInfoBlock />
      <HayouBlock />
      <ActivityBlock />
      <WorriesContainer />
      <EmergencyBlock />
      <FollowBlock />
    </div>
  );
}

export default function Component004HomeMainPage() {
  return (
    <div className="bg-[#111111] relative size-full" data-name="004_Home (Main page)">
      <Light />
      <MiniStripeLogo />
      <MainPageContenctBlock />
    </div>
  );
}