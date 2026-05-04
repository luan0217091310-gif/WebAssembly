(module
  (memory (export "memory") 1)

  (func (export "invert") (param $offset i32) (param $length i32)
    (local $end i32)
    (local $i i32)
    
    (local.set $end (i32.add (local.get $offset) (local.get $length)))
    (local.set $i (local.get $offset))
    
    (block $break
      (loop $loop
        (br_if $break (i32.ge_u (local.get $i) (local.get $end)))
        
        (i32.store8 
          (local.get $i) 
          (i32.sub (i32.const 255) (i32.load8_u (local.get $i)))
        )
        
        (i32.store8 
          (i32.add (local.get $i) (i32.const 1)) 
          (i32.sub (i32.const 255) (i32.load8_u (i32.add (local.get $i) (i32.const 1))))
        )
        
        (i32.store8 
          (i32.add (local.get $i) (i32.const 2)) 
          (i32.sub (i32.const 255) (i32.load8_u (i32.add (local.get $i) (i32.const 2))))
        )
        
        (local.set $i (i32.add (local.get $i) (i32.const 4)))
        (br $loop)
      )
    )
  )

  (func (export "grayscale") (param $offset i32) (param $length i32)
    (local $end i32)
    (local $i i32)
    (local $r i32)
    (local $g i32)
    (local $b i32)
    (local $gray i32)
    
    (local.set $end (i32.add (local.get $offset) (local.get $length)))
    (local.set $i (local.get $offset))
    
    (block $break
      (loop $loop
        (br_if $break (i32.ge_u (local.get $i) (local.get $end)))
        
        (local.set $r (i32.load8_u (local.get $i)))
        (local.set $g (i32.load8_u (i32.add (local.get $i) (i32.const 1))))
        (local.set $b (i32.load8_u (i32.add (local.get $i) (i32.const 2))))
        
        (local.set $gray
          (i32.shr_u
            (i32.add
              (i32.add
                (i32.mul (local.get $r) (i32.const 77))
                (i32.mul (local.get $g) (i32.const 150))
              )
              (i32.mul (local.get $b) (i32.const 29))
            )
            (i32.const 8)
          )
        )
        
        (i32.store8 (local.get $i) (local.get $gray))
        (i32.store8 (i32.add (local.get $i) (i32.const 1)) (local.get $gray))
        (i32.store8 (i32.add (local.get $i) (i32.const 2)) (local.get $gray))
        
        (local.set $i (i32.add (local.get $i) (i32.const 4)))
        (br $loop)
      )
    )
  )
)
