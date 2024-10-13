Feature: Harvest - Field Phase

Scenario: Fields are automatically harvested
  Given I start playing

  # Turn 1
  * I select "Take 1 Grain"
  * I select "Plow 1 Field"
  * I plow A1

  # Turn 2
  * I select "Take 1 Grain"
  * I select "Plow 1 Field"
  * I plow A2

  # Turn 3
  * I select "Sow and/or Bake bread"
  * I sow grain on A1
  * I sow grain on A2
  * I select "Take x Wood"

  # Turn 4
  * I select "Take x Clay"
  * I select "Take x Reed"

  # Harvest
  Then I have 2 grain in my supply
   And I have 2 grain on A1
   And I have 2 grain on A2

  When I feed my family

  # Turn 5
  * I select "Take x Clay"
  * I select "Take x Reed"

  # Turn 6
  * I select "Take x Clay"
  * I select "Take x Reed"

  # Turn 7
  * I select "Take x Clay"
  * I select "Take x Reed"

  # Harvest
  Then I have 4 grain in my supply
   And I have 1 grain on A1
   And I have 1 grain on A2

