# Q24: Create your own module and import it.

# Ive created a file named 'my_math.py' in the same folder with 

# Using this module in 'custom_module.py':
try:
    import Swayam_Joshi_python_training.functions.my_math as my_math
    
    if __name__ == "__main__":
        print(f"Result from custom module: {my_math.multiply(5, 4)}")
except ModuleNotFoundError:
    print("Please create 'my_math.py' first with a multiply function.")