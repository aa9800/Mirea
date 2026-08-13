"""
파이썬 스네이크 게임 (Snake Game)
- 방향키(화살표)로 조작
- 사과를 먹으면 점수 증가 및 몸 길이 증가
- 벽이나 자기 몸에 부딪히면 게임 오버
- 게임 오버 화면에서 R 키로 재시작, ESC 또는 창 닫기로 종료
"""

import pygame
import random
import sys

# ---------------------- 설정값 ----------------------
CELL_SIZE = 20          # 한 칸의 크기(px)
GRID_WIDTH = 30         # 가로 칸 수
GRID_HEIGHT = 20         # 세로 칸 수
SCREEN_WIDTH = CELL_SIZE * GRID_WIDTH
SCREEN_HEIGHT = CELL_SIZE * GRID_HEIGHT + 40  # 상단에 점수 표시 공간 추가
FPS = 10                # 초기 이동 속도 (숫자가 클수록 빠름)

# 색상 정의
BLACK = (15, 15, 20)
WHITE = (240, 240, 240)
GREEN = (0, 200, 90)
DARK_GREEN = (0, 140, 60)
RED = (220, 60, 60)
GRAY = (60, 60, 70)
YELLOW = (240, 200, 60)

UP = (0, -1)
DOWN = (0, 1)
LEFT = (-1, 0)
RIGHT = (1, 0)


class Snake:
    def __init__(self):
        self.reset()

    def reset(self):
        center = (GRID_WIDTH // 2, GRID_HEIGHT // 2)
        self.body = [center, (center[0] - 1, center[1]), (center[0] - 2, center[1])]
        self.direction = RIGHT
        self.next_direction = RIGHT
        self.grow_pending = 0

    def change_direction(self, new_dir):
        # 반대 방향으로는 즉시 이동 불가 (자기 몸에 바로 부딪히는 것 방지)
        opposite = (-self.direction[0], -self.direction[1])
        if new_dir != opposite:
            self.next_direction = new_dir

    def move(self):
        self.direction = self.next_direction
        head_x, head_y = self.body[0]
        dx, dy = self.direction
        new_head = (head_x + dx, head_y + dy)
        self.body.insert(0, new_head)
        if self.grow_pending > 0:
            self.grow_pending -= 1
        else:
            self.body.pop()

    def grow(self, amount=1):
        self.grow_pending += amount

    def head(self):
        return self.body[0]

    def collides_with_wall(self):
        x, y = self.head()
        return x < 0 or x >= GRID_WIDTH or y < 0 or y >= GRID_HEIGHT

    def collides_with_self(self):
        return self.head() in self.body[1:]


class Food:
    def __init__(self, snake_body):
        self.position = (0, 0)
        self.randomize(snake_body)

    def randomize(self, snake_body):
        while True:
            pos = (random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1))
            if pos not in snake_body:
                self.position = pos
                break


def draw_grid_cell(surface, color, grid_pos, offset_y):
    x, y = grid_pos
    rect = pygame.Rect(x * CELL_SIZE, y * CELL_SIZE + offset_y, CELL_SIZE, CELL_SIZE)
    pygame.draw.rect(surface, color, rect)
    pygame.draw.rect(surface, BLACK, rect, 1)


def draw_text(surface, text, size, color, center):
    font = pygame.font.SysFont("malgungothic", size)  # 한글 표시를 위해 맑은 고딕 사용
    text_surface = font.render(text, True, color)
    text_rect = text_surface.get_rect(center=center)
    surface.blit(text_surface, text_rect)


def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("파이썬 스네이크 게임")
    clock = pygame.time.Clock()

    HUD_HEIGHT = 40
    board_offset_y = HUD_HEIGHT

    snake = Snake()
    food = Food(snake.body)
    score = 0
    high_score = 0
    speed = FPS
    game_over = False

    running = True
    while running:
        # ---------------- 이벤트 처리 ----------------
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    running = False
                elif not game_over:
                    if event.key in (pygame.K_UP, pygame.K_w):
                        snake.change_direction(UP)
                    elif event.key in (pygame.K_DOWN, pygame.K_s):
                        snake.change_direction(DOWN)
                    elif event.key in (pygame.K_LEFT, pygame.K_a):
                        snake.change_direction(LEFT)
                    elif event.key in (pygame.K_RIGHT, pygame.K_d):
                        snake.change_direction(RIGHT)
                else:
                    if event.key == pygame.K_r:
                        snake.reset()
                        food.randomize(snake.body)
                        score = 0
                        speed = FPS
                        game_over = False

        # ---------------- 게임 로직 ----------------
        if not game_over:
            snake.move()

            if snake.collides_with_wall() or snake.collides_with_self():
                game_over = True
                high_score = max(high_score, score)

            if snake.head() == food.position:
                snake.grow(1)
                food.randomize(snake.body)
                score += 1
                # 점수가 오를수록 속도를 조금씩 증가시켜 난이도 상승
                speed = FPS + score // 5

        # ---------------- 그리기 ----------------
        screen.fill(BLACK)

        # HUD (점수판) 영역
        pygame.draw.rect(screen, (25, 25, 35), (0, 0, SCREEN_WIDTH, HUD_HEIGHT))
        draw_text(screen, f"점수: {score}   최고점수: {high_score}", 22, WHITE,
                  (SCREEN_WIDTH // 2, HUD_HEIGHT // 2))

        # 보드 배경
        pygame.draw.rect(screen, (25, 25, 30),
                          (0, board_offset_y, SCREEN_WIDTH, SCREEN_HEIGHT - board_offset_y))

        # 뱀 그리기
        for i, segment in enumerate(snake.body):
            color = DARK_GREEN if i == 0 else GREEN
            draw_grid_cell(screen, color, segment, board_offset_y)

        # 먹이 그리기
        draw_grid_cell(screen, RED, food.position, board_offset_y)

        # 게임오버 오버레이
        if game_over:
            overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT))
            overlay.set_alpha(180)
            overlay.fill(BLACK)
            screen.blit(overlay, (0, 0))
            draw_text(screen, "게임 오버!", 48, YELLOW,
                      (SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 40))
            draw_text(screen, f"최종 점수: {score}", 28, WHITE,
                      (SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 10))
            draw_text(screen, "R 키를 눌러 재시작 | ESC로 종료", 22, GRAY,
                      (SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 50))

        pygame.display.flip()
        clock.tick(speed)

    pygame.quit()
    sys.exit()


if __name__ == "__main__":
    main()
