export default function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] py-8 mt-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#71717a]">
            ReadLess — 少读一点，也能度过考试周和工作日
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-[#71717a]">
              AI 生成内容仅供参考
            </span>
            <span className="text-xs text-[#71717a]">
              &copy; {new Date().getFullYear()} ReadLess
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
