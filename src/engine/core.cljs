(ns engine.core
  (:require [xstate]
            [engine.machine :as machine]))

(-> (machine/get-definition)
    (xstate/createMachine #js {:actions
                               #js {:display-message (fn [] (println "ClojureScript FTW ;)"))}})
    (xstate/interpret)
    (.start))
