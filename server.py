from flask import Flask, request, jsonify, session, redirect, send_from_directory
import json
import os
import hashlib


print("Working directory:", os.getcwd())


app = Flask(__name__, static_folder='static', static_url_path='/static')
app.secret_key = 'your_secret_key_here'  # ОБЯЗАТЕЛЬНО! Чтобы работали сессии

USERS_FILE = 'users.json'

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as file:
            return json.load(file)
    return []

def save_users(users):
    with open(USERS_FILE, 'w') as file:
        json.dump(users, file, indent=4)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Главная страница
@app.route('/')
def home():
    return redirect('/pages/index.html')

# Отдача статических файлов
@app.route('/pages/<path:path>')
def pages(path):
    if path == 'profile.html' and 'user' not in session:
        return redirect('/pages/login.html')
    return send_from_directory('pages', path)

# Регистрация
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')

    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'All fields are required.'})

    if not email.endswith('@rocklinusd.org'):
        return jsonify({'success': False, 'message': 'Only @rocklinusd.org emails allowed.'})

    users = load_users()
    if any(u['email'] == email for u in users):
        return jsonify({'success': False, 'message': 'Email already registered.'})

    users.append({
        'name': name,
        'email': email,
        'password': hash_password(password),
        'role': role
    })
    save_users(users)

    session['user'] = email
    return jsonify({'success': True})

# Логин
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    users = load_users()
    user = next((u for u in users if u['email'] == email and u['password'] == hash_password(password)), None)

    if user:
        session['user'] = email
        return jsonify({'success': True})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials.'})

# Проверка входа
@app.route('/check_login', methods=['GET'])
def check_login():
    return jsonify({'logged_in': 'user' in session})

# Логаут
@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect('/pages/login.html')

# ===  ДОБАВЛЕННЫЙ РАЗДЕЛ ДЛЯ ФОРМЫ QC ===
@app.route('/submit_repair', methods=['POST'])
def submit_repair():
    data = request.get_json()
    try:
        if not os.path.exists("repairs.QC.json"):
            with open("repairs.QC.json", "w") as f:
                json.dump([], f)

        with open("repairs.QC.json", "r") as f:
            repairs = json.load(f)

        updated = False
        for r in repairs:
            if r.get("asset_tag") == data.get("asset_tag"):
                r.update({k: v for k, v in data.items() if v})  # только непустые поля
                updated = True
                break

        if not updated:
            repairs.append(data)

        with open("repairs.QC.json", "w") as f:
            json.dump(repairs, f, indent=4)

        return jsonify({"success": True})
    except Exception as e:
        print("Error:", e)
        return jsonify({"success": False}), 500


# === Путь к repairs.json ===
REPAIRS_FILE = 'repairs.QC.json'

# @app.route('/api/get_repairs')
#def get_repairs():
#    with open('repair.QC.json') as f:
#        data = json.load(f)
#    return jsonify(data)

# Загрузка страницы администратора
@app.route('/admin')
def admin_page():
    if 'user' not in session:
        return redirect('/pages/admin.html')

    users = load_users()
    user = next((u for u in users if u['email'] == session['user']), None)
    
    if not user or user.get('role') != 'teacher':
        return "Access denied", 403

    return send_from_directory('pages', 'admin.html')

# Получить все записи
@app.route('/api/repairs.QC', methods=['GET'])
def get_repairs():
    if not os.path.exists(REPAIRS_FILE):
        return jsonify([])

    with open(REPAIRS_FILE, 'r') as f:
        try:
            data = json.load(f)
        except Exception as e:
            print("JSON read error:", e)
            return jsonify([])

    return jsonify(data)

# Удалить строку
@app.route('/api/repairs.QC/<int:index>', methods=['DELETE'])
def delete_repair(index):
    if not os.path.exists(REPAIRS_FILE):
        print("File not found.")
        return jsonify({'error': 'File not found'}), 404

    try:
        with open(REPAIRS_FILE, 'r') as f:
            data = json.load(f)

        if index < 0 or index >= len(data):
            print("Invalid index:", index)
            return jsonify({'error': 'Invalid index'}), 400

        print(f"Deleting record at index {index}: {data[index]}")
        del data[index]

        with open(REPAIRS_FILE, 'w') as f:
            json.dump(data, f, indent=4)

        return jsonify({'success': True})
    except Exception as e:
        print("Error during deletion:", e)
        return jsonify({'error': 'Server error'}), 500
    
# Обновить одну запись по индексу
@app.route('/api/repairs.QC/<int:index>', methods=['PUT'])
def update_repair(index):
    updated_entry = request.json
    if not os.path.exists(REPAIRS_FILE):
        return jsonify({'error': 'File not found'}), 404

    with open(REPAIRS_FILE, 'r') as f:
        data = json.load(f)

    if index < 0 or index >= len(data):
        return jsonify({'error': 'Invalid index'}), 400

    data[index] = updated_entry

    with open(REPAIRS_FILE, 'w') as f:
        json.dump(data, f, indent=4)

    return jsonify({'success': True})

# Обработчик ошибки 404
@app.errorhandler(404)
def page_not_found(e):
    return redirect('/pages/Under_development.html')

@app.route('/api/me')
def get_current_user():
    if 'user' not in session:
        return jsonify({'error': 'Not logged in'}), 401

    users = load_users()
    user = next((u for u in users if u['email'] == session['user']), None)

    if user:
        return jsonify({'name': user['name'], 'email': user['email'], 'role': user['role']})
    else:
        return jsonify({'error': 'User not found'}), 404

# Запуск сервера
if __name__ == '__main__':
    app.run(debug=True)