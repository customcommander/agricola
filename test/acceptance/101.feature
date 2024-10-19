Feature: Build Rooms and/or Build Stables

Scenario: Abort task if player does not have enough resources
  Given I start playing
  When I select "Build Rooms and/or Build Stables"
  Then the game tells me I do not have enough resources

