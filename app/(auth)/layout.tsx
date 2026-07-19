import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col gap-5">
        <Image
          src="/logo-prolicita.png"
          alt="ProLicita"
          width={547}
          height={177}
          priority
          className="mx-auto h-auto w-[220px]"
        />
        {children}
      </div>
    </div>
  );
}
