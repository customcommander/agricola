(ns engine.core
  (:require [xstate]))

(def machine-definition
  {:initial :start
   :states {:start
            {:entry :display-message
             :always :end}
            :end
            {:type :final}}})

(-> (clj->js machine-definition)
    (xstate/createMachine #js {:actions
                               #js {:display-message (fn [] (println "ClojureScript FTW!"))}})
    (xstate/interpret)
    (.start))
