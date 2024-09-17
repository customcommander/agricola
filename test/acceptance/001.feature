Feature:

Scenario: Turns
  Given I start playing
  Then the current turn is 1
  When I select "Take 1 Grain"
  And I select "Take x Wood"
  Then the current turn is 2