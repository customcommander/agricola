Feature: Basic functionalities

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

Scenario: Setup
  Given I start a new game
  Then the actions should be:
    | Take X Wood | 2 wood |
    | Take X Clay | 1 clay |
    | Take X Reed | 1 reed |

Scenario: Replenish
  Given I start a new game
  When I complete 1 round
  Then the actions should be:
    | Take X Wood | 4 wood |
    | Take X Clay | 2 clay |
    | Take X Reed | 2 reed |

  When I complete 1 round
  Then the actions should be:
    | Take X Wood | 6 wood |
    | Take X Clay | 3 clay |
    | Take X Reed | 3 reed |

Scenario: Core Actions
  Given I start a new game
  When I complete the "take x wood" action
  Then I have 2 wood in my reserve
