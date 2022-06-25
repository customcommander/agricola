Feature: Basic functionalities

@taskMachine1
@harvestMachine1
Scenario: End of game
  # Stage 1
  Given I start a new game
  When I complete 4 rounds
  Then it is harvest time

  # Stage 2
  When I am done harvesting
  And I complete 3 rounds
  Then it is harvest time

  # Stage 3
  When I am done harvesting
  And I complete 2 rounds
  Then it is harvest time

  # Stage 4
  When I am done harvesting
  And I complete 2 rounds
  Then it is harvest time

  # Stage 5
  When I am done harvesting
  And I complete 2 rounds
  Then it is harvest time

  # Stage 6
  When I am done harvesting
  And I complete 1 round
  Then it is harvest time

  # End of game
  When I am done harvesting
  Then the game ends
