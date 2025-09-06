import svgPaths from "./svg-0s97g7iz8i";

function Icon() {
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

function Container() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-2.5 items-end justify-start leading-[0] p-0 relative shrink-0 text-left w-[248px]"
      data-name="Container"
    >
      <div className="font-heading font-normal relative shrink-0 text-[#e1ff00] text-[24px] w-full">
        <p className="block leading-[0.8]">Based on evidence-based practices</p>
      </div>
      <div className="font-sans not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">
          CBT, ACT, MBCT, positive psychology — scientifically proven methods No sugarcoating. Direct, honest, to the
          point. Man to man
        </p>
      </div>
    </div>
  );
}

export default function Container1() {
  return (
    <div
      className="box-border content-stretch flex flex-row gap-[13px] items-start justify-start p-0 relative size-full"
      data-name="Container"
    >
      <Icon />
      <Container />
    </div>
  );
}