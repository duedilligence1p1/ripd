'use client';

interface Step {
    id: number;
    title: string;
    description: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
}

export default function Stepper({ steps, currentStep, onStepClick }: StepperProps & { onStepClick?: (stepId: number) => void }) {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center flex-1">
                        {/* Step circle and content */}
                        <div
                            className={`flex flex-col items-center group ${onStepClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onStepClick?.(step.id)}
                        >
                            <div
                                className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  transition-all duration-300
                  ${currentStep > step.id
                                        ? 'step-completed group-hover:bg-green-600'
                                        : currentStep === step.id
                                            ? 'step-active'
                                            : 'step-pending group-hover:border-primary-500 group-hover:text-primary-500'
                                    }
                `}
                            >
                                {currentStep > step.id ? (
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    step.id
                                )}
                            </div>
                            <div className="mt-2 text-center hidden md:block">
                                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-primary-700' : 'text-gray-500'
                                    }`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                            </div>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 mx-4">
                                <div className={`h-1 rounded transition-all duration-300 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile step indicator */}
            <div className="mt-4 text-center md:hidden">
                <p className="text-sm font-medium text-primary-700">
                    {steps[currentStep - 1]?.title}
                </p>
                <p className="text-xs text-gray-500">
                    Etapa {currentStep} de {steps.length}
                </p>
            </div>
        </div>
    );
}
