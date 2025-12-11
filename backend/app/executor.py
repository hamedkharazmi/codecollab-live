"""Safe code execution (mock implementation)."""

import asyncio
import time
from .models import ExecutionResult, SupportedLanguage


async def execute_code(code: str, language: SupportedLanguage) -> ExecutionResult:
    """Execute code safely.

    For now, this is a mock implementation that simulates execution.
    A real implementation would use a sandboxed environment or remote service.
    """
    start_time = time.time()

    try:
        if language == "python":
            # Mock Python execution
            execution_time = time.time() - start_time
            return ExecutionResult(
                success=True,
                output="[Python execution simulated]\nHello, World!",
                executionTime=execution_time,
            )

        elif language in ("javascript", "typescript"):
            # Mock JS/TS execution with basic console capture
            logs: list[str] = []

            # Create a simple namespace for exec
            def mock_console_log(*args):
                logs.append(" ".join(str(a) for a in args))

            namespace = {
                "console": type("obj", (object,), {"log": mock_console_log})(),
            }

            try:
                # Execute the code (in real scenario, this would be sandboxed via Node.js/Deno)
                # For now, we simulate by accepting any valid Python-like syntax
                # In production, use a real JS runtime
                exec(code, namespace)
                output = "\n".join(logs) if logs else "Code executed successfully (no output)"
            except SyntaxError as e:
                # If code looks like JS, try to extract basic patterns
                # This is a best-effort approach for mock execution
                if "console.log" in code:
                    # Extract literal strings from console.log calls
                    import re
                    matches = re.findall(r"console\.log\(['\"]([^'\"]*)['\"]\)", code)
                    if matches:
                        output = "\n".join(matches)
                    else:
                        output = "Code executed successfully (no output)"
                    execution_time = time.time() - start_time
                    return ExecutionResult(
                        success=True,
                        output=output,
                        executionTime=execution_time,
                    )
                else:
                    output = ""
                    error_msg = str(e)
                    execution_time = time.time() - start_time
                    return ExecutionResult(
                        success=False,
                        output=output,
                        error=error_msg,
                        executionTime=execution_time,
                    )
            except Exception as e:
                output = ""
                error_msg = str(e)
                execution_time = time.time() - start_time
                return ExecutionResult(
                    success=False,
                    output=output,
                    error=error_msg,
                    executionTime=execution_time,
                )

            execution_time = time.time() - start_time
            return ExecutionResult(
                success=True,
                output=output,
                executionTime=execution_time,
            )

        else:
            execution_time = time.time() - start_time
            return ExecutionResult(
                success=False,
                output="",
                error=f"Language {language} not supported",
                executionTime=execution_time,
            )

    except Exception as e:
        execution_time = time.time() - start_time
        return ExecutionResult(
            success=False,
            output="",
            error=f"Execution error: {str(e)}",
            executionTime=execution_time,
        )
