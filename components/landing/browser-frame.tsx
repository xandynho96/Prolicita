import Image from "next/image";

export function BrowserFrame({
  src,
  alt,
  width,
  height,
  priority,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-white shadow-[0_20px_50px_rgba(22,27,34,0.12)]">
      <div className="flex items-center gap-1.5 border-b border-border bg-[#F5F6F8] px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#E4E7EC]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#E4E7EC]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#E4E7EC]" />
      </div>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className="h-auto w-full"
      />
    </div>
  );
}
