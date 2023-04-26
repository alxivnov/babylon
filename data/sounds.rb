# Welcome to Sonic Pi


use_synth :prophet

# POSITIVE

1.times do
  play :c5, release: 1, cutoff: 80
  sleep 0.03
  play :c5 + 3 + 0.01, release: 2, cutoff: 100
  sleep 0.03
  play :c5 + 7 - 0.01, release: 1, cutoff: 120
  sleep 0.05
end

# NEGATIVE

##| 1.times do
##|   play :c5, release: 1, cutoff: 80
##|   sleep 0.03
##|   play :c5 - 3 - 0.1, release: 2, cutoff: 100
##|   sleep 0.03
##|   play :c5 - 7 + 0.1, release: 1, cutoff: 120
##|   sleep 0.05
##| end
