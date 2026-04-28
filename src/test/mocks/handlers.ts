import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('https://api.anthropic.com/v1/messages', () => {
    return HttpResponse.json({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            fields: { 'Document Type': 'Aadhaar Card', 'ID Number': '1234-5678-9012' },
            confidence: { 'Document Type': 0.97, 'ID Number': 0.91 },
          }),
        },
      ],
    });
  }),
];
