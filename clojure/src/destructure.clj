;to break input params
(defn summer "add item1 and item3 in given list "
  [[x1 _ x3]] (+ x1 x3)); not the embedded square brackets
(println "sum =" (summer [1 2 4 5]))

(defn name-summary [[name1 name2 & others]]
  (println (str name1 ", " name2) "and" (count others) "others"))
(name-summary ["Moe" "Larry" "Curly" "Shemp"]) ; -> Moe, Larry and 2 others

;sum of first and 3rd items divided by sum of everything indicated by :as
(defn first-and-third-percentage [[n1 _ n3 :as coll]]
  (/ (+ n1 n3) (apply + coll)))
(println "1-3/% = " (first-and-third-percentage [4 5 6 7]));

;extracting from map
(defn summer-sales-percentage
  ; The keywords below indicate the keys whose values
  ; should be extracted by destructuring.
  ; The non-keywords are the local bindings
  ; into which the values are placed.
  [{june :june july :july august :august :as all}]
  (let [summer-sales (+ june july august)
        all-sales (apply + (vals all))]
    (/ summer-sales all-sales)))

(def sales {
             :january   100 :february 200 :march      0 :april    300
             :may       200 :june     100 :july     400 :august   500
             :september 200 :october  300 :november 400 :december 600})

(println "summer sales = " (summer-sales-percentage sales)) ; ratio reduced from 1000/3300 -> 10/33
