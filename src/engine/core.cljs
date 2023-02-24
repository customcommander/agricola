(ns engine.core
  (:require [xstate]
            [engine.machine :as machine]
            [engine.services.setup :as setup]))

(-> (machine/get-definition)
    (xstate/createMachine #js {:actions
                               #js {:display-message (fn [] (println "ClojureScript FTW ;)"))}})
    (xstate/interpret)
    (.start))
