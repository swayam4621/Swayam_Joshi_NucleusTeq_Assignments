# Data Processor Task

A small member-data validation utility built for the Python Core Concepts training.

## Features
- Dictionary/List based member storage
- Regex validation for email and phone
- Custom `InvalidMemberDataError` exception
- `Member` class (OOP)
- `filter()`/`map()` with lambdas for functional filtering

## Usage
```bash
python -m venv venv
source venv/bin/activate      # venv\Scripts\activate on Windows
pip install setuptools wheel
python setup.py sdist bdist_wheel
pip install dist/data_processor_task-1.0.0-py3-none-any.whl
python main.py
```

## Screenshots of outputs in terminal
### Running main.py
<img width="843" height="347" alt="image" src="https://github.com/user-attachments/assets/5b66d639-7f6e-4642-acb1-fb1a92300947" />


### Importing the package from dist folder
<img width="930" height="207" alt="image" src="https://github.com/user-attachments/assets/c8a3a3d6-48b5-4c4e-9910-4f419b34ba0a" />

### Project structure & .whl file in dist/
<img width="1006" height="672" alt="image" src="https://github.com/user-attachments/assets/bc8486d7-493b-49ea-adeb-e0dbd249455d" />
