import Image from "next/image";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image 
        src="/logo_full.png" 
        alt="DokoDoko Logo" 
        width={180} 
        height={50} 
        className="object-contain"
        priority
      />
    </div>
  );
}
