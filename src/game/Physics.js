export function overlaps(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

export function moveAndCollide(body, level, deltaSeconds) {
  const colliders = [...level.platforms, ...level.movingPlatforms];
  const wasGrounded = body.grounded;
  body.grounded = false;

  const previousX = body.x;
  body.x += body.vx * deltaSeconds;
  for (const platform of colliders) {
    if (!overlaps(body, platform)) continue;
    if (body.vx > 0 && previousX + body.w <= platform.x + 8)
      body.x = platform.x - body.w;
    else if (body.vx < 0 && previousX >= platform.x + platform.w - 8)
      body.x = platform.x + platform.w;
  }

  const previousY = body.y;
  body.y += body.vy * deltaSeconds;
  for (const platform of colliders) {
    if (!overlaps(body, platform)) continue;
    if (
      body.vy >= 0 &&
      previousY + body.h <=
        platform.y + Math.max(12, body.vy * deltaSeconds + 4)
    ) {
      body.y = platform.y - body.h;
      body.vy = 0;
      body.grounded = true;
      if (platform.direction)
        body.x += platform.speed * platform.direction * deltaSeconds;
    } else if (body.vy < 0 && previousY >= platform.y + platform.h - 6) {
      body.y = platform.y + platform.h;
      body.vy = 0;
    }
  }

  return body.grounded && !wasGrounded;
}
