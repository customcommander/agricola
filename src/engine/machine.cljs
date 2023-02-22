(ns engine.machine)

(def definition
  {:initial :start
   :states
   {:start
    {:entry :display-message
     :always :end}
    :end
    {:type :final}}})
