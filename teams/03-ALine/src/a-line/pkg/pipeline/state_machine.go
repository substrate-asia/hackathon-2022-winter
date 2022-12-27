package pipeline

type StepMachine struct {
	stepState IStepState
}

func InitialStepStateMachine() *StepMachine {
	return &StepMachine{
		stepState: NotRunInstance,
	}
}

func (s *StepMachine) Run() {
	s.stepState.execute(s)
}

func (s *StepMachine) State() State {
	return s.stepState.getState()
}
