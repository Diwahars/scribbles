;(def boys (sorted-map :k1 :Stan, :k2 :Cartman , :k3 :Kenny , :k4 :Kyle ))
;(def boys (hash-map :k1 :Stan, :k2 :Cartman , :k3 :Kenny , :k4 :Kyle ))

(println "---------------MAPS------------")

(def boys {:k1 :Stan, :k2 :Cartman , :k3 :Kenny , :k4 :Kyle})

(println (boys :k1 ))
(println (keys boys))
(println (vals boys))
(println (assoc boys :k1 :Butters, :k5 :Clyde ))
(println (dissoc boys :k1  ))
(println (select-keys boys [:k1, :k2]))
(doseq [[key boy] boys]
  (println (name key) " is southpark boy " (name boy)))

(def person {
              :name "Mark Volkmann"
              :address {
                         :street "644 Glen Summit"
                         :city "St. Charles"
                         :state "Missouri"
                         :zip 63304}
              :employer {
                          :name "Object Computing, Inc."
                          :address {
                                     :street "12140 Woodcrest Executive Drive, Suite 250"
                                     :city "Creve Coeur"
                                     :state "Missouri"
                                     :zip 63141}}})

(println "employer zip of person is " (((person :employer) :address) :zip))
(println "employer state of person is " ( get-in person [:employer, :address, :state]))
(println "employer city of person " (-> person :employer :address :city)) ; thread macro passes one func output as input to other
(println "employer city of person " (reduce get person [:employer :address :city])) ; reduce repeatedly applies 'get' function on each item in collection

(def new_person (assoc-in person [:employer :address :city] "Richmond")) ; modify the nested value
(println "modified city: " (-> new_person :employer :address :city))
