<?php
declare(strict_types=1);

/**
 * Creates tables and a demo account.   Usage:  php backend/bin/migrate.php
 * Works for DB_DRIVER=sqlite (default, zero setup) or DB_DRIVER=mysql.
 */

use App\Core\{Database, Env};

$root = dirname(__DIR__);
spl_autoload_register(function (string $class) use ($root): void {
    if (strncmp($class, 'App\\', 4) === 0) {
        $f = $root . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (is_file($f)) {
            require $f;
        }
    }
});

$driver = Database::driver();

if ($driver === 'mysql') {
    $pdo = new PDO(
        sprintf('mysql:host=%s;port=%s;charset=utf8mb4', Env::get('DB_HOST', '127.0.0.1'), Env::get('DB_PORT', '3306')),
        Env::get('DB_USER', 'root'),
        Env::get('DB_PASS'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $pdo->exec('CREATE DATABASE IF NOT EXISTS `' . Env::get('DB_NAME', 'thesis_compliance') . '` CHARACTER SET utf8mb4');
    $sql = file_get_contents($root . '/database/schema.sql');
    // drop CREATE DATABASE / USE lines; we already selected the DB through the PDO connection below
    $sql = preg_replace('/^(CREATE DATABASE|USE)\b.*$/mi', '', $sql);
    $pdo = Database::pdo();
    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        $pdo->exec($statement);
    }
} else {
    if (!is_dir($root . '/data')) {
        mkdir($root . '/data', 0755, true);
    }
    $pdo = Database::pdo();
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          institution TEXT,
          role TEXT NOT NULL DEFAULT 'member',
          plan TEXT NOT NULL DEFAULT 'starter',
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          file_name TEXT NOT NULL,
          stored_name TEXT NOT NULL,
          file_size INTEGER NOT NULL,
          mime_type TEXT NOT NULL,
          status TEXT NOT NULL,
          compliance_score INTEGER NOT NULL,
          issues INTEGER NOT NULL DEFAULT 0,
          ai_percentage REAL,
          similarity_percentage REAL,
          word_count INTEGER,
          summary TEXT,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          subject TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
    ");
}

// Demo account + sample documents (same as the original Node seed)
$exists = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$exists->execute(['demo@complyai.io']);
if (!$exists->fetch()) {
    $pdo->prepare('INSERT INTO users (name,email,password_hash,institution,role,plan,created_at) VALUES (?,?,?,?,?,?,?)')
        ->execute(['Demo Educator', 'demo@complyai.io', password_hash('demo1234', PASSWORD_BCRYPT), 'Demo University', 'admin', 'professional', Database::now()]);
    $uid = (int) $pdo->lastInsertId();

    $samples = [
        ['CS101 Syllabus 2026', 'Syllabus', 'compliant', 96, 0, 'Meets all curriculum and assessment policy requirements.'],
        ['Exam Integrity Policy', 'Policy Document', 'review', 74, 3, 'Plagiarism clause needs clearer enforcement steps.'],
        ['Accreditation Report Q2', 'Accreditation Report', 'compliant', 91, 1, 'Strong alignment with accreditation standards.'],
        ['BIO204 Course Outline', 'Course Outline', 'non_compliant', 48, 6, 'Missing learning outcomes and assessment weighting.'],
        ['Final Exam - Statistics', 'Exam Paper', 'review', 68, 2, 'Some questions exceed the approved syllabus scope.'],
        ['Research Ethics Handbook', 'Policy Document', 'compliant', 88, 1, 'Comprehensive and policy-aligned.'],
    ];
    $insert = $pdo->prepare(
        'INSERT INTO documents (user_id,title,category,file_name,stored_name,file_size,mime_type,status,compliance_score,issues,summary,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    foreach ($samples as $i => [$title, $cat, $status, $score, $issues, $summary]) {
        $daysAgo = (count($samples) - $i) * 4;
        $insert->execute([$uid, $title, $cat, "$title.pdf", "seed-$i.pdf", 120000 + $i * 8000, 'application/pdf',
            $status, $score, $issues, $summary, gmdate('Y-m-d H:i:s', time() - $daysAgo * 86400)]);
    }
    echo "Seeded demo user: demo@complyai.io / demo1234\n";
}

echo "Database ready ($driver).\n";
