function HeroBlockQuestion() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-5 items-start justify-start leading-[0] p-0 relative shrink-0 text-center w-full"
      data-name="Hero_block_question"
    >
      <div className="font-heading font-normal relative shrink-0 text-[#e1ff00] text-[36px] w-full">
        <p className="block leading-[0.8]">How are you?</p>
      </div>
      <div className="font-sans not-italic relative shrink-0 text-[#ffffff] text-[20px] w-full">
        <p className="block leading-none">{`Check in with yourself — it's the first step to self-care! Do it everyday.`}</p>
      </div>
    </div>
  );
}

function ImFeelingDown() {
  return (
    <div className="h-[26px] relative shrink-0 w-full" data-name="I\'m feeling down...">
      <div className="absolute font-['Kreon:Regular',_sans-serif] font-normal inset-0 leading-[0] text-[#ffffff] text-[32px] text-center">
        <p className="block leading-[0.8]">{`I'm neutral`}</p>
      </div>
    </div>
  );
}

function MoodPrograssbar() {
  return (
    <div className="bg-[#2d2b2b] h-[30px] relative rounded-xl shrink-0 w-full" data-name="Mood_prograssbar">
      <div className="absolute bg-[#e1ff00] h-[30px] left-0 rounded-xl top-0 w-[186px]" data-name="Block">
        <div
          aria-hidden="true"
          className="absolute border-2 border-[#2d2b2b] border-solid inset-0 pointer-events-none rounded-xl"
        />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-10 items-center justify-start p-0 relative shrink-0 w-full"
      data-name="Container"
    >
      <ImFeelingDown />
      <MoodPrograssbar />
    </div>
  );
}

export default function Container1() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-20 items-center justify-start p-0 relative size-full"
      data-name="Container"
    >
      <HeroBlockQuestion />
      <Container />
    </div>
  );
}