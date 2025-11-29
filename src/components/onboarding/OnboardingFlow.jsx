import { OnboardingProvider, useOnboarding } from '../../context/OnboardingContext';
import { StuckInput } from './StuckInput';
import { FrictionQuestion } from './FrictionQuestion';
import { BlockPatternReveal } from './BlockPatternReveal';
import { MomentumSequenceDisplay } from './MomentumSequenceDisplay';
import { Preferences } from './Preferences';
import { Complete } from './Complete';

const OnboardingFlowContent = ({ onComplete }) => {
  const { step } = useOnboarding();

  switch (step) {
    case 1:
      return <StuckInput />;
    case 2:
      return <FrictionQuestion />;
    case 3:
      return <BlockPatternReveal />;
    case 4:
      return <MomentumSequenceDisplay />;
    case 5:
      return <Preferences />;
    case 6:
      return <Complete onComplete={onComplete} />;
    default:
      return <StuckInput />;
  }
};

export const OnboardingFlow = ({ onComplete }) => {
  return (
    <OnboardingProvider>
      <OnboardingFlowContent onComplete={onComplete} />
    </OnboardingProvider>
  );
};
