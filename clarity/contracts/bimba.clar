(define-constant ERR-UNAUTHORIZED u1)
(define-fungible-token bimba u1000000)
(define-constant contract-creator tx-sender)
(define-data-var token-uri (optional (string-utf8 256)) none)

(ft-mint? bimba u10000 contract-creator)
;; add mint for other contributors

(define-public (transfer (to principal) (amount uint)) 
  (ft-transfer? bimba amount tx-sender to))

(define-public (transfer-from (amount uint) (from principal) (to principal))
  (begin
    (asserts! (is-eq from tx-sender)
      (err ERR-UNAUTHORIZED))

    (ft-transfer? bimba amount from to)
  ))

(define-read-only (get-name)
  (ok "Bimba Coin"))

(define-read-only (get-symbol)
  (ok "$BIMBA"))

(define-read-only (get-decimals)
  (ok u0))

(define-read-only (get-balance-of (user principal))
  (ok (ft-get-balance bimba user)))

(define-read-only (get-total-supply)
  (ok (ft-get-supply bimba)))

(define-public (set-token-uri (value (string-utf8 256)))
  (if 
    (is-eq tx-sender contract-creator) 
      (ok (var-set token-uri (some value))) 
    (err ERR-UNAUTHORIZED)))

(define-read-only (get-token-uri)
  (ok (var-get token-uri)))

(define-public (submit-tweet (url (string-utf8 256)))
  (begin
    (print { type: "submission", action: "created", data: { submitter: tx-sender, url: url } })
    (ok url)))

(define-public (grant-to-recipients (recipients (list 100 principal)))
  (begin
    (map grant-to-recipient recipients)
    (ok u0)))

(define-public (grant-to-recipient (recipient principal))
  (if 
    (is-eq tx-sender contract-creator) 
      (ok (ft-mint? bimba u1 recipient)) 
    (err ERR-UNAUTHORIZED)))

(define-public (grant-to-recipient-amount (recipient principal) (amount uint))
  (if 
    (is-eq tx-sender contract-creator) 
      (ok (ft-mint? bimba amount recipient)) 
    (err ERR-UNAUTHORIZED)))