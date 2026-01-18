'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

// 步骤配置类型
export interface StepType {
  selector: string;
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number; // 提示框最大宽度（px），默认 320
  minWidth?: number; // 提示框最小宽度（px），默认 200
}

// Tour Context 类型
interface TourContextValue {
  isOpen: boolean;
  currentStep: number;
  steps: StepType[];
  setIsOpen: (open: boolean) => void;
  nextStep: () => void;
  previousStep: () => void;
  skip: () => void;
  goToStep: (step: number) => void;
}

// 创建 Context - 明确类型定义
const TourContext = createContext<TourContextValue | undefined>(undefined);

// Provider Props
interface TourProviderProps {
  children: ReactNode;
  steps: StepType[];
}

// Tour Provider 组件
export function TourProvider({ children, steps }: TourProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      } else {
        setIsOpen(false);

        return prev;
      }
    });
  }, [steps.length]);

  const previousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const skip = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
        setIsOpen(true);
      }
    },
    [steps.length],
  );

  const handleSetIsOpen = useCallback((open: boolean) => {
    setIsOpen(open);

    if (open) {
      setCurrentStep(0);
    }
  }, []);

  const value: TourContextValue = useMemo(
    () => ({
      isOpen,
      currentStep,
      steps,
      setIsOpen: handleSetIsOpen,
      nextStep,
      previousStep,
      skip,
      goToStep,
    }),
    [isOpen, currentStep, steps, handleSetIsOpen, nextStep, previousStep, skip, goToStep],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

// useTour Hook
export function useTour(): TourContextValue {
  const context = useContext(TourContext);

  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }

  return context;
}
