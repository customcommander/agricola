(ns engine.machine)

;; JavaScript definition of the main machine
(defn get-definition []
  (clj->js
   {:initial :start
    :states
    {:start
     {:entry :display-message
      :always :end}
     :end
     {:type :final}}}))
