Feature: Basic functionalities

Scenario: Sequence
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

@predefined_setup
Scenario: There is a new action each turn.
  # Stage 1
  Given I start a new game
  Then the new action is 1-sow-and-or-bake-bread
  When I complete 1 round
  Then the new action is 1-major-or-minor-improvement
  When I complete 1 round
  Then the new action is 1-sheep
  When I complete 1 round
  Then the new action is 1-fences

  # End of stage 1. Entering stage 2.
  When I complete 1 round
  And I am done harvesting
  Then the new action is 2-stone
  When I complete 1 round
  Then the new action is 2-after-renovation-also-major-or-minor-improvement
  When I complete 1 round
  Then the new action is 2-after-family-growth-also-minor-improvement

  # End of stage 2. Entering stage 3.
  When I complete 1 round
  And I am done harvesting
  Then the new action is 3-vegetable
  When I complete 1 round
  Then the new action is 3-wild-boar

  # End of stage 3. Entering stage 4.
  When I complete 1 round
  And I am done harvesting
  Then the new action is 4-stone
  When I complete 1 round
  Then the new action is 4-cattle

  # End of stage 4. Entering stage 5.
  When I complete 1 round
  And I am done harvesting
  Then the new action is 5-plow-and-or-sow-field
  When I complete 1 round
  Then the new action is 5-family-growth-even-without-room

  # End of stage 5. Entering stage 6.
  When I complete 1 round
  And I am done harvesting
  Then the new action is 6-after-renovation-also-fences
