function Switch() {
  return (
    <div
      className="absolute bg-[#2d2b2b] left-[18px] rounded-[100px] shadow-[0px_2px_4px_0px_rgba(39,39,39,0.1)] size-4 top-0.5"
      data-name="Switch"
    />
  );
}

export default function Switch1() {
  return (
    <div className="bg-[#e1ff00] relative rounded-[100px] size-full" data-name="Switch">
      <Switch />
    </div>
  );
}