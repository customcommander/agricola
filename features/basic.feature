Feature: Basic functionalities

# NB: the 'complete x round(s)' step always perform
# the same two actions: 'take x wood' and 'take x clay'
# and assumes only two workers throughout the game.
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

Scenario: Replenish
  Given I start a new game
  Then the actions should be:
    | Take X Wood | 2 wood |
    | Take X Clay | 1 clay |
    | Take X Reed | 1 reed |

  When I complete the "take x wood" action
  And I complete the "take x clay" action
  Then I have 2 wood in my reserve
  And I have 1 clay in my reserve
  And the actions should be:
    | Take X Wood | 2 wood |
    | Take X Clay | 1 clay |
    | Take X Reed | 2 reed |

  When I complete the "take x wood" action
  And I complete the "take x clay" action
  Then I have 4 wood in my reserve
  And I have 2 clay in my reserve
  And the actions should be:
    | Take X Wood | 2 wood |
    | Take X Clay | 1 clay |
    | Take X Reed | 3 reed |
