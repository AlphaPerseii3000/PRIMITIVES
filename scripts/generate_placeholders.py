import wave
import math
import struct
import os

def generate_wav(filename, duration_ms, freq_start, freq_end, volume=0.5, wave_type='sine'):
    sample_rate = 44100
    num_samples = int(sample_rate * duration_ms / 1000)
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1) # Mono
        wav_file.setsampwidth(2) # 2 bytes per sample (16-bit)
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            t = i / sample_rate
            progress = i / num_samples
            
            # Frequency ramp
            current_freq = freq_start + (freq_end - freq_start) * progress
            
            if wave_type == 'sine':
                value = math.sin(2 * math.pi * current_freq * t)
            elif wave_type == 'square':
                value = 1.0 if math.sin(2 * math.pi * current_freq * t) > 0 else -1.0
            elif wave_type == 'sawtooth':
                value = 2.0 * (t * current_freq - math.floor(0.5 + t * current_freq))
            elif wave_type == 'noise':
                import random
                value = (random.random() * 2) - 1
            else:
                value = 0
            
            # Simple envelope (attack/decay)
            envelope = 1.0
            if progress < 0.1:
                envelope = progress / 0.1
            elif progress > 0.8:
                envelope = (1.0 - progress) / 0.2
            
            sample = int(value * volume * envelope * 32767.0)
            wav_file.writeframes(struct.pack('<h', sample))

os.makedirs('public/audio/snap', exist_ok=True)

# Snap Lock: High pitch, clean, short
generate_wav('public/audio/snap/snap-lock.wav', 150, 880, 440, 0.6, 'sine')
print("Generated snap-lock.wav")

# Snap Wobble: Lower pitch, detuned/wobbly (simulated with slide), slightly longer
generate_wav('public/audio/snap/snap-wobble.wav', 200, 400, 380, 0.5, 'sine')
print("Generated snap-wobble.wav")

# Snap Reject: Dissonant, noise/saw, short
generate_wav('public/audio/snap/snap-reject.wav', 100, 100, 50, 0.4, 'sawtooth')
print("Generated snap-reject.wav")
