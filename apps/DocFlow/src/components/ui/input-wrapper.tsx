interface InputWrapperProps {
  children: React.ReactNode;
}

export const InputWrapper = ({ children }: InputWrapperProps) => (
  <div className="rounded-xl border border-gray-200 bg-gray-50/50 transition-all duration-300 focus-within:border-violet-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-violet-500/20">
    {children}
  </div>
);
