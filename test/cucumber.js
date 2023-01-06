const common = {
  publishQuiet: true,
  import: [ 'test/features/_steps.js'
          , 'test/features/_world.js']
};

export default {
  ...common,
  tags: 'not @predefined_setup'
}

export const predefined_setup = {
  ...common,
  tags: '@predefined_setup',
  worldParameters: {
    events: [
      {
        type: 'SETUP_GAME',
        rounds: [ '1-sow-and-or-bake-bread'
                , '1-major-or-minor-improvement'
                , '1-sheep'
                , '1-fences'
                , '2-stone'
                , '2-after-renovation-also-major-or-minor-improvement'
                , '2-after-family-growth-also-minor-improvement'
                , '3-vegetable'
                , '3-wild-boar'
                , '4-stone'
                , '4-cattle'
                , '5-plow-and-or-sow-field'
                , '5-family-growth-even-without-room'
                , '6-after-renovation-also-fences']
      }
    ]
  }
}