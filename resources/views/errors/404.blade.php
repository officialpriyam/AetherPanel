<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>404 | {{ config('app.name', 'Pterodactyl') }}</title>
    <style>
        :root {
            --primary: #2563EB;
            --bgA: #020617;
            --bgB: #0f172a;
            --card: rgba(15, 23, 42, 0.72);
            --border: rgba(148, 163, 184, 0.35);
            --text: #e2e8f0;
            --sub: #94a3b8;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: "Rubik", system-ui, -apple-system, Segoe UI, sans-serif;
            background:
                radial-gradient(circle at 18% 8%, rgba(59, 130, 246, 0.2), transparent 45%),
                linear-gradient(140deg, var(--bgA), var(--bgB));
            color: var(--text);
            padding: 20px;
        }

        .card {
            width: 100%;
            max-width: 680px;
            border: 1px solid var(--border);
            border-radius: 16px;
            background: var(--card);
            backdrop-filter: blur(14px);
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
            padding: 30px;
            text-align: center;
        }

        .code {
            font-size: 72px;
            line-height: 1;
            margin: 0;
            color: #ffffff;
        }

        .title {
            margin: 12px 0 4px;
            font-size: 24px;
            font-weight: 600;
        }

        .desc {
            margin: 0;
            color: var(--sub);
            font-size: 15px;
        }

        .actions {
            margin-top: 22px;
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            border-radius: 10px;
            border: 1px solid var(--border);
            padding: 10px 14px;
            text-decoration: none;
            color: var(--text);
            font-size: 14px;
            transition: 0.2s ease;
            background: rgba(15, 23, 42, 0.55);
        }

        .btn.primary {
            border-color: rgba(59, 130, 246, 0.35);
            background: rgba(59, 130, 246, 0.2);
            color: #eff6ff;
        }

        .btn:hover {
            transform: translateY(-1px);
        }
    </style>
</head>
<body>
    <div class="card">
        <p class="code">404</p>
        <p class="title">Page not found</p>
        <p class="desc">The page you tried to reach does not exist or has been moved.</p>
        <div class="actions">
            <a class="btn primary" href="/">Go to Dashboard</a>
            <a class="btn" href="javascript:history.back()">Go Back</a>
        </div>
    </div>
</body>
</html>
