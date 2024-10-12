Feature: Replenish

Scenario: Game automatically replenishes stock
  Given I start playing
  Then  I have the following stock on the board
    | Stock | Quantity |
    | Wood  | 2        |
    | Clay  | 1        |
    | Reed  | 1        |
    | Food  | 1        |

  # Turn 1
  When I select "Take 1 Grain"
  And  I select "Day Laborer"
  Then I have the following stock on the board
    | Stock | Quantity |
    | Wood  | 4        |
    | Clay  | 2        |
    | Reed  | 2        |
    | Food  | 2        |

  # Turn 2
  When I select "Take 1 Grain"
  And  I select "Day Laborer"
  Then I have the following stock on the board
    | Stock | Quantity |
    | Wood  | 6        |
    | Clay  | 3        |
    | Reed  | 3        |
    | Food  | 3        |

  # Turn 3
  When I select "Take 1 Grain"
  And  I select "Day Laborer"
  Then I have the following stock on the board
    | Stock | Quantity |
    | Wood  | 8        |
    | Clay  | 4        |
    | Reed  | 4        |
    | Food  | 4        |

